// src/components/modules/idea-detail/TableOfContents.tsx
"use client";

import { HeadingItem } from "@/types";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  headings: HeadingItem[];
  onHeadingClick: (id: string) => void;
  activeId: string | null;
}

const getTocHeadings = (headings: HeadingItem[]) => {
  return headings.filter((h) => h.level === 2 || h.level === 3);
};

export function TableOfContents({
  headings,
  onHeadingClick,
  activeId,
}: TableOfContentsProps) {
  const tocHeadings = getTocHeadings(headings);

  if (tocHeadings.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">Tidak ada daftar isi.</div>
    );
  }

  return (
    <ul className="space-y-1">
      {tocHeadings.map((heading) => (
        <li
          key={heading.id}
          onClick={() => onHeadingClick(heading.id)}
          className={cn(
            "cursor-pointer truncate text-sm transition-colors duration-150 mb-2",
            activeId === heading.id
              ? "text-primary font-medium"
              : "text-muted-foreground hover:text-primary",
            heading.level === 3 && "ml-4"
          )}
          title={heading.text}
        >
          {heading.text || "Empty Heading"}
        </li>
      ))}
    </ul>
  );
}
