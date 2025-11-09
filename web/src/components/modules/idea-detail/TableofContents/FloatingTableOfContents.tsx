// src/components/modules/idea-detail/FloatingTableOfContents.tsx

"use client";

import { HeadingItem } from "@/types";
import { TableOfContents } from "@/components/modules/idea-detail/TableofContents/TableOfContents";
import { cn } from "@/lib/utils";

interface FloatingToCProps {
  headings: HeadingItem[];
  onHeadingClick: (id: string) => void;
  activeId: string | null;
}

export function FloatingTableOfContents({
  headings,
  onHeadingClick,
  activeId,
}: FloatingToCProps) {
  const tocHeadings = headings.filter((h) => h.level === 2 || h.level === 3);

  if (tocHeadings.length === 0) {
    return null;
  }

  return (
    <aside className="fixed top-1/2 -translate-y-1/2 left-0 hidden lg:block">
      <div className="group relative">
        <div className="flex flex-col items-start space-y-2.5 p-3 transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-95 group-hover:pointer-events-none">
          {tocHeadings.map((heading) => (
            <div
              key={heading.id}
              className={cn(
                "h-0.5 rounded-full transition-all duration-150",
                activeId === heading.id
                  ? "w-8 bg-primary scale-110"
                  : "bg-muted-foreground/30",
                heading.level === 3
                  ? activeId === heading.id
                    ? "w-3"
                    : "w-3"
                  : "w-5",
                "hover:bg-primary cursor-pointer"
              )}
              title={heading.text}
              onClick={() => onHeadingClick(heading.id)}
            />
          ))}
        </div>

        <div
          className="absolute top-0 left-0
                    opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
                    pointer-events-none group-hover:pointer-events-auto
                    transition-all duration-300 ease-in-out
                    w-64 max-h-[calc(100vh-200px)]
                    overflow-y-auto p-4 
                    bg-popover
                    rounded-lg border shadow-xl z-50"
        >
          <TableOfContents
            headings={headings}
            onHeadingClick={onHeadingClick}
            activeId={activeId}
          />
        </div>
      </div>
    </aside>
  );
}
