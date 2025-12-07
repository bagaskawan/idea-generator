"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import { IdeaDetail } from "@/types";
import { PdfExportDocument } from "./PdfExportTemplate";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import PDFViewer to avoid SSR issues
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

interface PdfPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: IdeaDetail;
}

export function PdfPreviewDialog({
  open,
  onOpenChange,
  idea,
}: PdfPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>PDF Preview</DialogTitle>
        </DialogHeader>
        <div className="flex-1 w-full bg-slate-100 p-4 overflow-hidden">
          <PDFViewer className="w-full h-full border rounded-md shadow-sm">
            <PdfExportDocument idea={idea} />
          </PDFViewer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
