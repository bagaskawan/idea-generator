"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

// Initialize mermaid with basic config
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "inherit",
});

interface MermaidProps {
  chart: string;
  className?: string;
}

export const Mermaid = ({ chart, className = "" }: MermaidProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chart && ref.current) {
      const renderChart = async () => {
        try {
          setError(null);
          // Generate unique ID to avoid conflicts
          const id = `mermaid-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          setSvg(svg);
        } catch (err) {
          console.error("Mermaid failed to render:", err);
          setError("Failed to render diagram. The syntax might be invalid.");
          setSvg("");
        }
      };
      renderChart();
    }
  }, [chart]);

  if (error) {
    return (
      <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-32">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`mermaid-container flex justify-center p-4 bg-white dark:bg-zinc-900 rounded-lg border overflow-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
