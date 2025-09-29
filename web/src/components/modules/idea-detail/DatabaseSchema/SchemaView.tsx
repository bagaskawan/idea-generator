"use client";

import { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { toast } from "sonner";
import { Button } from "@/components/shared/ui/button";
import { Bot, Loader2, Workflow, FileCode, Copy } from "lucide-react";
import TableNode from "./TableNode";
import { FullProject, SchemaResponse, Table, Column } from "@/types";
import { getLayoutedElements } from "@/lib/dagre-utils";
import { jsonToSql } from "@/lib/sql-generator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/shared/ui/dialog";
import { ScrollArea } from "@/components/shared/ui/scroll-area";

type SchemaViewProps = {
  project: FullProject;
  initialSchema: SchemaResponse | null;
};

const nodeTypes = {
  table: TableNode,
};

export default function SchemaView({
  project,
  initialSchema,
}: SchemaViewProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSchema, setHasSchema] = useState(!!initialSchema);
  const [sqlCode, setSqlCode] = useState<string | null>(null); // <-- State baru untuk SQL & modal

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

  const transformDataToFlow = useCallback((data: SchemaResponse | null) => {
    // ... (fungsi ini tetap sama seperti sebelumnya, tidak perlu diubah)
    if (!data || !data.schema) {
      setNodes([]);
      setEdges([]);
      return;
    }
    let rawSchemaData = data.schema;
    let schemaArray: Table[];
    try {
      if (typeof rawSchemaData === "string") {
        rawSchemaData = JSON.parse(rawSchemaData);
      }
      if (
        rawSchemaData &&
        typeof rawSchemaData === "object" &&
        "schema" in rawSchemaData &&
        Array.isArray((rawSchemaData as any).schema)
      ) {
        schemaArray = (rawSchemaData as any).schema;
      } else if (Array.isArray(rawSchemaData)) {
        schemaArray = rawSchemaData;
      } else {
        throw new Error("Invalid schema format after processing.");
      }
    } catch (error: any) {
      console.error("Failed to process schema data:", error);
      toast.error("Failed to display schema", {
        description: "The data format is incorrect.",
      });
      return;
    }
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];
    schemaArray.forEach((table: Table) => {
      initialNodes.push({
        id: table.table_name,
        type: "table",
        position: { x: 0, y: 0 },
        data: { name: table.table_name, columns: table.columns },
      });
      table.columns.forEach((col: Column & { references?: string }) => {
        if (col.references) {
          const targetTableMatch = col.references.match(/^(\w+)\(/);
          if (targetTableMatch && targetTableMatch[1]) {
            const targetTable = targetTableMatch[1];
            initialEdges.push({
              id: `e-${table.table_name}-${col.name}-to-${targetTable}`,
              source: table.table_name,
              target: targetTable,
              type: "smoothstep",
              animated: true,
              style: { strokeWidth: 1.5, stroke: "#888" },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 15,
                height: 15,
                color: "#888",
              },
            });
          }
        }
      });
    });
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, []);

  useEffect(() => {
    if (initialSchema) {
      transformDataToFlow(initialSchema);
    }
  }, [initialSchema, transformDataToFlow]);

  // --- Fungsi handler baru untuk tombol Export ---
  const handleExportToSql = () => {
    if (!initialSchema) {
      toast.error("No schema data available to export.");
      return;
    }
    let schemaArray: Table[];
    try {
      let rawSchemaData = initialSchema.schema;
      if (typeof rawSchemaData === "string") {
        rawSchemaData = JSON.parse(rawSchemaData);
      }
      if (
        rawSchemaData &&
        typeof rawSchemaData === "object" &&
        "schema" in rawSchemaData &&
        Array.isArray((rawSchemaData as any).schema)
      ) {
        schemaArray = (rawSchemaData as any).schema;
      } else if (Array.isArray(rawSchemaData)) {
        schemaArray = rawSchemaData;
      } else {
        throw new Error("Invalid schema format.");
      }
    } catch (error) {
      toast.error("Cannot export SQL due to invalid schema format.");
      return;
    }
    const sql = jsonToSql(schemaArray);
    setSqlCode(sql); // <-- Set state SQL untuk membuka modal
  };

  const handleGenerateSchema = async () => {
    // ... (fungsi ini tetap sama seperti sebelumnya, tidak perlu diubah)
    setIsGenerating(true);
    toast.info(
      `AI is ${
        hasSchema ? "re-generating" : "designing"
      } your database schema...`
    );
    try {
      const workbenchContent = "";
      const problemStatement = project.problem_statement || "";
      const userStoriesMatch = workbenchContent.match(
        /### User Stories\s*([\s\S]*?)(?=\n###|$)/
      );
      const apiEndpointsMatch = workbenchContent.match(
        /### API Endpoints\s*([\s\S]*?)(?=\n###|$)/
      );
      const res = await fetch("/api/ai/generate-database-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          projectDescription: problemStatement,
          userStories: userStoriesMatch ? userStoriesMatch[1].trim() : "",
          apiEndpoints: apiEndpointsMatch ? apiEndpointsMatch[1].trim() : "",
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate schema.");
      }
      const data: SchemaResponse = await res.json();
      transformDataToFlow(data);
      setHasSchema(true);
      toast.success("Database schema processed successfully!");
    } catch (e: any) {
      toast.error("Error", { description: e.message });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
      >
        <Background />
        <Controls />
      </ReactFlow>

      {/* --- Perbarui Tampilan Tombol --- */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Button onClick={handleGenerateSchema} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Bot className="w-4 h-4 mr-2" />
          )}
          {hasSchema ? "Re-generate Schema" : "Generate Schema with AI"}
        </Button>

        {hasSchema && (
          <Button
            variant="outline"
            onClick={handleExportToSql}
            disabled={isGenerating}
          >
            <FileCode className="w-4 h-4 mr-2" />
            Export to SQL
          </Button>
        )}
      </div>

      {!hasSchema && !isGenerating && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-background/80 p-8 rounded-lg shadow-lg backdrop-blur-sm">
          {/* ... (konten ini tetap sama) ... */}
        </div>
      )}

      {/* --- Tambahkan Komponen Modal Dialog --- */}
      <Dialog
        open={!!sqlCode}
        onOpenChange={(isOpen) => !isOpen && setSqlCode(null)}
      >
        <DialogContent className="sm:max-w-4xl max-w-4xl w-full h-[85vh] flex flex-col p-0">
          <DialogHeader>
            <DialogTitle className="p-6 pb-2">Generated SQL Schema</DialogTitle>
            <DialogDescription className="px-6">
              This is the SQL code generated from your schema. You can copy and
              use it in your database.
            </DialogDescription>
          </DialogHeader>
          <div className="relative flex-1 min-h-0 px-6">
            <ScrollArea className="h-full rounded-md border bg-muted/50">
              {/* whitespace-pre akan mencegah text wrapping dan memicu overflow horizontal */}
              <pre className="text-sm p-4 font-mono whitespace-pre">
                <code>{sqlCode}</code>
              </pre>
            </ScrollArea>
            {/* Tombol Copy diletakkan di luar ScrollArea agar tidak ikut scroll */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-8 h-8 w-8 z-10"
              onClick={() => {
                if (sqlCode) {
                  navigator.clipboard.writeText(sqlCode);
                  toast.success("SQL code copied to clipboard!");
                }
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter className="p-6 pt-4">
            <Button variant="outline" onClick={() => setSqlCode(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
