"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/shared/ui/button";
import { ArrowLeft, Bot, Loader2, GitBranch, Copy, Check } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/shared/ui/dialog";
import { ScrollArea } from "@/components/shared/ui/scroll-area";

interface FlowchartViewProps {
  projectId: string;
  blueprintContext: string;
}

// Parse Mermaid graph TD to ReactFlow nodes/edges
function parseMermaidToReactFlow(mermaidCode: string): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeMap = new Map<string, { label: string; shape: string }>();

  const lines = mermaidCode
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("graph"));

  // First pass: extract all nodes
  lines.forEach((line) => {
    // Match node definitions like: User((User)), FE[Frontend], DB[(Database)]
    const nodePatterns = [
      /(\w+)\(\(([^)]+)\)\)/g, // ((Circle))
      /(\w+)\[\(([^)]+)\)\]/g, // [(Cylinder)]
      /(\w+)\[([^\]]+)\]/g, // [Box]
      /(\w+)\{\{([^}]+)\}\}/g, // {{Hexagon}}
      /(\w+)\(([^)]+)\)/g, // (Rounded)
    ];

    for (const pattern of nodePatterns) {
      let match;
      const testLine = line;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(testLine)) !== null) {
        const id = match[1];
        const label = match[2];
        if (!nodeMap.has(id)) {
          nodeMap.set(id, { label, shape: "default" });
        }
      }
    }
  });

  // Second pass: extract edges
  lines.forEach((line) => {
    // Match: SOURCE -->|Label| TARGET or SOURCE --> TARGET
    const edgePattern = /(\w+)\s*-->\|?([^|]*)\|?\s*(\w+)/g;
    let match;
    while ((match = edgePattern.exec(line)) !== null) {
      const source = match[1];
      const label = match[2]?.trim() || "";
      // Extract target (might have shape definition after it)
      const targetPart = match[3];
      const target = targetPart.replace(/[\[\(\{].*$/, "");

      if (source && target) {
        edges.push({
          id: `e-${source}-${target}-${edges.length}`,
          source,
          target,
          label: label || undefined,
          type: "smoothstep",
          animated: true,
          style: { strokeWidth: 2 },
        });

        // Ensure source and target are in nodeMap
        if (!nodeMap.has(source)) {
          nodeMap.set(source, { label: source, shape: "default" });
        }
        if (!nodeMap.has(target)) {
          nodeMap.set(target, { label: target, shape: "default" });
        }
      }
    }
  });

  // Create nodes with positions (grid layout)
  const nodeArray = Array.from(nodeMap.entries());
  const cols = Math.ceil(Math.sqrt(nodeArray.length));

  nodeArray.forEach(([id, { label }], index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    nodes.push({
      id,
      position: { x: col * 250, y: row * 150 },
      data: { label },
      style: {
        padding: "16px 24px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
        background: "#ffffff",
        border: "2px solid #e5e7eb",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      },
    });
  });

  return { nodes, edges };
}

export const FlowchartView = ({
  projectId,
  blueprintContext,
}: FlowchartViewProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [chartCode, setChartCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasFlowchart, setHasFlowchart] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Load saved flowchart on mount
  useEffect(() => {
    const loadSavedFlowchart = async () => {
      try {
        const data = await api.getFlowchart(projectId);
        if (data.chart) {
          setChartCode(data.chart);
          const { nodes: parsedNodes, edges: parsedEdges } =
            parseMermaidToReactFlow(data.chart);
          setNodes(parsedNodes);
          setEdges(parsedEdges);
          setHasFlowchart(true);
        }
      } catch (error) {
        console.log("No saved flowchart found");
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadSavedFlowchart();
  }, [projectId]);

  // Auto-generate if no flowchart exists
  useEffect(() => {
    if (!isInitialLoading && !hasFlowchart && blueprintContext.trim()) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialLoading, hasFlowchart]);

  const handleGenerate = async () => {
    if (!blueprintContext?.trim()) {
      toast.warning("No blueprint content", {
        description: "Please add some content to your blueprint first.",
      });
      return;
    }

    setIsLoading(true);
    toast.info("AI is generating your system architecture...");

    try {
      const data = await api.generateFlowchart(projectId, blueprintContext);
      setChartCode(data.chart);
      const { nodes: parsedNodes, edges: parsedEdges } =
        parseMermaidToReactFlow(data.chart);
      setNodes(parsedNodes);
      setEdges(parsedEdges);
      setHasFlowchart(true);
      toast.success("System architecture generated!");
    } catch (error) {
      console.error("Flowchart generation error:", error);
      toast.error("Failed to generate flowchart", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!chartCode) return;
    try {
      await navigator.clipboard.writeText(chartCode);
      setIsCopied(true);
      toast.success("Mermaid code copied!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (isInitialLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background />
        <Controls />
      </ReactFlow>

      {/* Top Bar */}
      <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4">
        <Link href={`/idea/${projectId}`}>
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Canvas Idea
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Bot className="w-4 h-4 mr-2" />
            )}
            {hasFlowchart ? "Re-generate" : "Generate with AI"}
          </Button>

          {hasFlowchart && (
            <Button variant="outline" onClick={() => setShowCodeDialog(true)}>
              <GitBranch className="w-4 h-4 mr-2" />
              View Mermaid Code
            </Button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!hasFlowchart && !isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-background/80 p-8 rounded-lg shadow-lg backdrop-blur-sm">
          <GitBranch className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">System Architecture</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            AI will analyze your project and create a visual system architecture
            diagram.
          </p>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">
              AI is drafting your architecture...
            </p>
          </div>
        </div>
      )}

      {/* Mermaid Code Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mermaid Diagram Code</DialogTitle>
            <DialogDescription>
              You can copy this code and use it in any Mermaid-compatible tool.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 z-10"
              onClick={handleCopyCode}
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <ScrollArea className="h-64 rounded-md border bg-zinc-950">
              <pre className="p-4 text-sm font-mono text-zinc-100">
                <code>{chartCode}</code>
              </pre>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCodeDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
