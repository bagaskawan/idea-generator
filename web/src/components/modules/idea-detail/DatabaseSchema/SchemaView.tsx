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
import { Bot, Loader2, Workflow } from "lucide-react";
import TableNode from "./TableNode"; // Pastikan path ini benar

// Tipe data yang relevan
interface TableData {
  table_name: string;
  columns: any[];
}
interface SchemaResponse {
  schema: TableData[];
}
type FullProject = {
  id: string;
  title: string | null;
  content: string | null;
  project_data: { [key: string]: any } | null;
};

const nodeTypes = {
  tableNode: TableNode,
};

export default function SchemaView({
  project,
  initialSchema,
}: {
  project: FullProject;
  initialSchema: SchemaResponse | null;
}) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  // State `hasSchema` sekarang menjadi satu-satunya sumber kebenaran
  const [hasSchema, setHasSchema] = useState(!!initialSchema);

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

  // useEffect sekarang hanya bertugas untuk render data awal
  useEffect(() => {
    if (initialSchema) {
      transformDataToFlow(initialSchema);
    }
  }, [initialSchema]);

  const handleGenerateSchema = async () => {
    setIsGenerating(true);
    toast.info(
      `AI is ${
        hasSchema ? "re-generating" : "designing"
      } your database schema...`
    );

    try {
      const workbenchContent = project.content || "";
      const problemStatement = project.project_data?.problem_statement || "";
      const userStoriesMatch = workbenchContent.match(
        /### User Stories\s*([\s\S]*?)(?=\n###|$)/
      );
      const apiEndpointsMatch = workbenchContent.match(
        /### API Endpoints\s*([\s\S]*?)(?=\n###|$)/
      );

      const res = await fetch("/api/ai/generate-database-schema", {
        method: "POST",
        body: JSON.stringify({
          projectId: project.id,
          projectDescription: problemStatement,
          userStories: userStoriesMatch ? userStoriesMatch[1].trim() : "",
          apiEndpoints: apiEndpointsMatch ? apiEndpointsMatch[1].trim() : "",
        }),
      });

      if (!res.ok) throw new Error("Failed to generate schema from server.");

      const data: SchemaResponse = await res.json();
      transformDataToFlow(data);
      setHasSchema(true); // Set `hasSchema` menjadi true setelah berhasil generate
      toast.success("Database schema processed successfully!");
    } catch (e: any) {
      toast.error("Error", { description: e.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const transformDataToFlow = (data: SchemaResponse) => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const tables = data.schema;
    let x = 0;
    let y = 0;

    tables.forEach((table, index) => {
      newNodes.push({
        id: table.table_name,
        type: "tableNode",
        position: { x, y },
        data: { table },
      });

      x += 300;
      if ((index + 1) % 3 === 0) {
        x = 0;
        y += 300;
      }

      table.columns.forEach((col) => {
        if (col.is_foreign_key && col.references) {
          const targetTable = col.references.split("(")[0];
          newEdges.push({
            id: `e-${table.table_name}-${col.name}-to-${targetTable}`,
            source: table.table_name,
            target: targetTable,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
            animated: true,
            style: { strokeWidth: 1.5 },
          });
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
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
      >
        <Background />
        <Controls />
      </ReactFlow>

      {/* Tombol Aksi di Pojok Atas */}
      <div className="absolute top-4 left-4 z-10">
        <Button onClick={handleGenerateSchema} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Bot className="w-4 h-4 mr-2" />
          )}
          {hasSchema ? "Re-generate Schema" : "Generate Schema with AI"}
        </Button>
      </div>

      {/* Tampilan Awal (Hanya muncul jika belum ada skema) */}
      {!hasSchema && !isGenerating && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-background/80 p-8 rounded-lg shadow-lg backdrop-blur-sm">
          <Workflow className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Database Schema Visualizer</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Click the generate button to get started. The AI will analyze your
            project and create a relational database schema for you.
          </p>
        </div>
      )}
    </div>
  );
}
