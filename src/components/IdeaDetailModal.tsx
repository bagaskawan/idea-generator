"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataItem } from "@/utils/types";
import { Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface IdeaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DataItem | null;
}

export default function IdeaDetailModal({
  isOpen,
  onClose,
  item,
}: IdeaDetailModalProps) {
  if (!item) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="md:max-w-3xl bg-white rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {item.name}
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-700 leading-relaxed prose max-w-none">
          <ReactMarkdown>{item.description}</ReactMarkdown>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Tutup
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
