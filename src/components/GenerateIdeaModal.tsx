"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";

interface GenerateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (interest: string) => void;
  isLoading: boolean;
}

export default function GenerateIdeaModal({
  isOpen,
  onClose,
  onGenerate,
  isLoading,
}: GenerateIdeaModalProps) {
  const [interest, setInterest] = useState("");

  const handleGenerateClick = () => {
    if (interest.trim()) {
      onGenerate(interest);
      setInterest(""); // Reset the input field
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Dapatkan Ide dari AI
          </DialogTitle>
          <DialogDescription>
            Masukkan bidang minat atau teknologi yang Anda ingin eksplorasi. AI
            akan membuatkan ide proyek berdasarkan input Anda.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="interest" className="text-gray-700">
            Bidang Minat Proyek (contoh: IoT, Edukasi, Kesehatan)
          </Label>
          <Input
            id="interest"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            placeholder="e.g., 'Aplikasi edukasi untuk anak'"
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Batal
            </Button>
          </DialogClose>
          <Button
            onClick={handleGenerateClick}
            disabled={isLoading || !interest.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Generate Ide
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
