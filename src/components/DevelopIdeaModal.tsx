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
import { Loader2, Wand2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface DevelopIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DataItem | null;
  elaboration: string | null;
  isLoading: boolean;
}

export default function DevelopIdeaModal({
  isOpen,
  onClose,
  item,
  elaboration,
  isLoading,
}: DevelopIdeaModalProps) {
  if (!item) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="md:max-w-5xl bg-white rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            <span>Mengembangkan Ide: {item.name}</span>
          </DialogTitle>
          <DialogDescription className="pt-2 text-gray-500">
            Perbandingan antara ide awal Anda dengan hasil elaborasi dari AI.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 my-4 max-h-[60vh] overflow-y-auto pr-4">
          {/* Left Column: Original Idea */}
          <div className="pr-4 border-r border-gray-200">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              Ide Awal
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-700">Nama Ide:</h4>
                <p className="text-gray-600">{item.name}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700">Deskripsi:</h4>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Developed Idea */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              Hasil Pengembangan (AI)
            </h3>
            <div className="text-sm text-gray-700 leading-relaxed prose max-w-none">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  <p className="mt-4 text-gray-600">
                    AI sedang berpikir... mohon tunggu sebentar.
                  </p>
                </div>
              ) : (
                <ReactMarkdown>{elaboration || ""}</ReactMarkdown>
              )}
            </div>
          </div>
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
