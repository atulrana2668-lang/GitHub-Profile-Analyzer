"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import mermaid from "mermaid";

// Initialize mermaid once at module level
let mermaidInitialized = false;
function ensureMermaidInitialized() {
  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        primaryColor: "#8b5cf6",
        primaryTextColor: "#fff",
        primaryBorderColor: "#7c3aed",
        lineColor: "#a78bfa",
        secondaryColor: "#1e1b4b",
        tertiaryColor: "#0f172a",
        fontSize: "14px",
        nodeBorder: "#7c3aed",
        clusterBkg: "#1e1b4b",
        clusterBorder: "#7c3aed",
        edgeLabelBackground: "#1e293b",
      },
      securityLevel: "loose",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis",
        padding: 20,
      },
    });
    mermaidInitialized = true;
  }
}

interface MermaidDiagramProps {
  definition: string;
  className?: string;
}

export function MermaidDiagram({ definition, className = "" }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const renderDiagram = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      ensureMermaidInitialized();

      // Sanitize the definition to avoid mermaid parsing errors
      let sanitizedDefinition = definition.trim();

      if (!sanitizedDefinition) {
        throw new Error("Empty diagram definition");
      }

      // Remove style blocks that often cause parse errors
      sanitizedDefinition = sanitizedDefinition.replace(/\n\s*style\s+[^\n]+/g, "");

      // Validate the diagram first
      await mermaid.parse(sanitizedDefinition);

      const id = `mermaid-${retryKey}-${Date.now()}`;
      const { svg: renderedSvg } = await mermaid.render(id, sanitizedDefinition);
      setSvg(renderedSvg);
    } catch (err) {
      console.error("Mermaid rendering error:", err);
      setError(err instanceof Error ? err.message : "Failed to render diagram");
    } finally {
      setLoading(false);
    }
  }, [definition, retryKey]);

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  function handleRetry() {
    setRetryKey((prev) => prev + 1);
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        <span className="ml-3 text-sm text-slate-400">Rendering diagram...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center ${className}`}>
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={handleRetry}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`group relative ${className}`}>
      <div
        ref={containerRef}
        className="overflow-auto rounded-xl border border-white/5 bg-slate-950/50 p-4"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <button
        onClick={handleRetry}
        className="absolute right-3 top-3 rounded-lg bg-slate-800/80 p-1.5 opacity-0 transition-all hover:bg-slate-700 group-hover:opacity-100"
        title="Re-render diagram"
      >
        <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
      </button>
    </div>
  );
}
