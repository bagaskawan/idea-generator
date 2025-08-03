"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Calendar, Database, Eye, Trash2 } from "lucide-react";
import { DataItem } from "@/utils/types";

interface IdeaListProps {
  data: DataItem[];
  deleteItem: (id: string) => void;
  showDetails: (item: DataItem) => void;
}

export default function IdeaList({
  data,
  deleteItem,
  showDetails,
}: IdeaListProps) {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center justify-between">
          <span className="flex items-center gap-2"></span>
          <span className="text-sm font-normal bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {data.length} items
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          {data.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No data yet</p>
              <p className="text-gray-400 text-sm">
                Create your first entry to get started
              </p>
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-gray-50/80 sticky top-0">
                  <TableRow className="hover:bg-gray-50/80">
                    <TableHead className="font-semibold text-gray-700 w-[200px]">
                      Ide
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Deskripsi
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[120px]">
                      Created
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[80px] text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className={cn(
                        "hover:bg-blue-50/50 transition-colors duration-150",
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      )}
                    >
                      <TableCell className="font-medium text-gray-900">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-[300px]">
                        <div className="truncate" title={item.description}>
                          {item.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.createdAt.toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => showDetails(item)}
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteItem(item.id)}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
