"use client";

import { Handle, Position } from "reactflow";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Database, KeyRound, Link2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shared/ui/tooltip";
import { Column } from "@/types";

interface TableNodeData {
  name: string;
  columns: (Column & { is_foreign_key?: boolean; references?: string })[];
}

const TableNode = ({ data }: { data: TableNodeData }) => {
  const { name, columns } = data;

  if (!name || !columns) {
    return null;
  }

  return (
    <Card className="w-64 bg-background shadow-lg border-2 min-h-[220px]">
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !bg-primary"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-primary"
      />

      <CardHeader className="py-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Database className="w-4 h-4 text-muted-foreground" />
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs pt-0 pb-3">
        <ul className="space-y-1">
          {columns.map((col) => (
            <li
              key={col.name}
              className="flex justify-between items-center border-t py-1"
            >
              <div className="flex items-center gap-2">
                {col.is_primary_key && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <KeyRound className="w-4 h-4 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>Primary Key</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {/* --- PERBAIKAN FINAL: Gunakan 'references' atau 'is_foreign_key' --- */}
                {(col.references || col.is_foreign_key) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link2 className="w-4 h-4 text-cyan-500" />
                      </TooltipTrigger>
                      <TooltipContent>{`Foreign Key: ${col.references}`}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <span className="font-mono">{col.name}</span>
              </div>
              <span className="font-mono text-muted-foreground">
                {col.type}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TableNode;
