"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import { Badge } from "@/components/shared/ui/badge";
import {
  Pencil,
  Check,
  X,
  Loader2,
  Trash2,
  Plus,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// Tipe untuk item, bisa berupa string atau object dengan properti 'text'
type ListItem = { text: string; [key: string]: any } | string;

interface EditableSidebarFieldProps {
  fieldName: string;
  initialValue: string | ListItem[];
  onSave: (
    newValue: string | ListItem[]
  ) => Promise<{ success: boolean; error?: string }>;
  editAs?: "textarea" | "list";
  displayAs?: "text" | "list" | "badge";
}

export default function EditableSidebarField({
  fieldName,
  initialValue,
  onSave,
  editAs = "textarea",
  displayAs = "text",
}: EditableSidebarFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const isObjectList =
    Array.isArray(value) && value.length > 0 && typeof value[0] === "object";

  const handleSave = () => {
    startTransition(async () => {
      const result = await onSave(value);
      if (result.success) {
        toast.success(`"${fieldName}" updated successfully.`);
        setIsEditing(false);
      } else {
        toast.error(`Failed to update ${fieldName}`, {
          description: result.error,
        });
      }
    });
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  // --- Logika khusus untuk mode edit "list" ---
  const handleItemChange = (index: number, text: string) => {
    const newItems = [...(value as ListItem[])];
    if (isObjectList) {
      (newItems[index] as { text: string }).text = text;
    } else {
      newItems[index] = text;
    }
    setValue(newItems);
  };

  const handleAddItem = () => {
    const newItem = isObjectList ? { text: "" } : "";
    setValue([...(value as ListItem[]), newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setValue((value as ListItem[]).filter((_, i) => i !== index));
  };
  // --- Akhir dari logika "list" ---

  // Tampilan saat tidak dalam mode edit
  if (!isEditing) {
    const hasValue = Array.isArray(initialValue)
      ? initialValue.length > 0
      : !!initialValue;
    return (
      // PERBAIKAN 1: Tambahkan padding kanan (pr-8) agar teks tidak tertimpa ikon
      <div className="relative group min-h-[30px] pr-8">
        {!hasValue ? (
          <p className="text-sm text-muted-foreground">Belum didefinisikan.</p>
        ) : displayAs === "badge" ? (
          <div className="flex flex-wrap gap-2">
            {(initialValue as string[]).map((item, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {item}
              </Badge>
            ))}
          </div>
        ) : displayAs === "list" ? (
          <ul className="space-y-2">
            {(initialValue as { text: string }[]).map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
            {initialValue}
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Tampilan saat dalam mode edit
  return (
    <div className="space-y-3">
      {editAs === "list" ? (
        <>
          {(value as ListItem[]).map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={
                  isObjectList
                    ? (item as { text: string }).text
                    : (item as string)
                }
                onChange={(e) => handleItemChange(index, e.target.value)}
                className="h-9"
              />
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 shrink-0"
                onClick={() => handleRemoveItem(index)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </>
      ) : (
        <Textarea
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          className="text-sm min-h-[100px]"
          autoFocus
        />
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        {/* PERBAIKAN 2: Tampilkan loading indicator saat isPending true */}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isPending}
          className="w-[70px]"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
        </Button>
      </div>
    </div>
  );
}
