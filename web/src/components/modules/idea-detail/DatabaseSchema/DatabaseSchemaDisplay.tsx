"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Database, KeyRound, Link2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shared/ui/tooltip";

interface Column {
  name: string;
  type: string;
  is_primary_key?: boolean;
  is_foreign_key?: boolean;
  references?: string;
}

interface Table {
  table_name: string;
  columns: Column[];
}

interface DatabaseSchemaDisplayProps {
  schema: Table[];
}

export const DatabaseSchemaDisplay = ({
  schema,
}: DatabaseSchemaDisplayProps) => {
  if (!schema || schema.length === 0) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>No Schema Generated</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            The AI could not generate a database schema from the provided
            context.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-center mb-8">Database Schema</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schema.map((table) => (
          <Card key={table.table_name} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                {table.table_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {table.columns.map((col) => (
                  <li
                    key={col.name}
                    className="flex justify-between items-center text-sm border-b pb-2"
                  >
                    <div className="flex items-center gap-2">
                      {col.is_primary_key && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <KeyRound className="w-4 h-4 text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent>Primary Key</TooltipContent>
                        </Tooltip>
                      )}
                      {col.is_foreign_key && (
                        <Link2 className="w-4 h-4 text-cyan-500">
                          <title>{`Foreign Key: ${col.references}`}</title>
                        </Link2>
                      )}
                      <span className="font-medium">{col.name}</span>
                    </div>
                    <Badge variant="outline">{col.type}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
