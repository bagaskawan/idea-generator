// src/components/ai/CustomFormattingToolbar.tsx
"use client";

import {
  FormattingToolbar,
  BlockTypeSelect,
  BasicTextStyleButton,
  TextAlignButton,
  CreateLinkButton,
  ColorStyleButton,
} from "@blocknote/react";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { AIMenuDropdown } from "./AIMenuDropdown";

export function CustomFormattingToolbar() {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <FormattingToolbar>
      <BlockTypeSelect key="blockTypeSelect" />
      <BasicTextStyleButton key="bold" basicTextStyle="bold" />
      <BasicTextStyleButton key="italic" basicTextStyle="italic" />
      <BasicTextStyleButton key="underline" basicTextStyle="underline" />
      <TextAlignButton key="left" textAlignment="left" />
      <TextAlignButton key="center" textAlignment="center" />
      <TextAlignButton key="right" textAlignment="right" />
      <ColorStyleButton key="color" />
      <CreateLinkButton key="link" />

      {/* Custom AI button */}
      <div className="relative">
        <button
          type="button"
          className="bn-button bn-formatting-toolbar-button"
          onClick={() => setShowDropdown((o) => !o)}
          aria-label="AI Actions"
        >
          <Sparkles className="w-5 h-5 text-purple-500" />
        </button>

        {showDropdown && (
          <AIMenuDropdown onClose={() => setShowDropdown(false)} />
        )}
      </div>
    </FormattingToolbar>
  );
}
