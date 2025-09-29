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

// Ini adalah komponen kustom untuk setiap node (tabel)
const TableNode = ({ data }: { data: any }) => {
  const { table } = data;

  return (
    <Card className="w-64 bg-background shadow-lg border-2">
      {/* Handle adalah titik koneksi untuk garis relasi */}
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
          {table.table_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs pt-0 pb-3">
        <ul className="space-y-1">
          {table.columns.map((col: any) => (
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
                {col.is_foreign_key && (
                  <Link2 className="w-4 h-4 text-cyan-500">
                    <title>{`Foreign Key: ${col.references}`}</title>
                  </Link2>
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
