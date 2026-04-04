"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Github,
  ArrowLeft,
  GitFork,
  Star,
  Layers,
  GitMerge,
  Code2,
  FileCode,
  FolderTree,
  Network,
  Workflow,
  BookOpen,
  FolderOpen,
  ChevronRight,
  Folder,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { formatNumber } from "@/lib/utils";

interface PageProps {
  params: { owner: string; repo: string };
}

export default function RepoAnalysisPage({ params }: PageProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "architecture" | "dependencies" | "structure">("overview");

  const { data, isLoading, isError, error, refetch, status } = trpc.analyzeRepo.useQuery({
    owner: params.owner,
    repo: params.repo,
  }, {
    retry: false,
  });

  // Debug logging
  useEffect(() => {
    console.log("Query status:", status);
    console.log("Is loading:", isLoading);
    console.log("Is error:", isError);
    console.log("Error:", error);
    console.log("Data:", data);
  }, [status, isLoading, isError, error, data]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <main className="min-h-dvh bg-slate-950 text-slate-200">
        {/* Header */}
        <header className="sticky top-0 z-50 animate-fade-in border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between p-4 px-6 gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
                <Github className="h-5 w-5 text-violet-400 animate-pulse" />
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-tight text-white sm:text-base">
                  {params.owner} / <span className="text-violet-300">{params.repo}</span>
                </h1>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-5 w-16 animate-pulse rounded-full bg-slate-800" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-slate-800" />
            </div>
          </div>
        </header>

        {/* Loading Content */}
        <div className="mx-auto max-w-6xl p-4 px-6 py-8">
          <div className="space-y-6">
            {/* Banner Skeleton */}
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 backdrop-blur-sm">
              <div className="h-6 w-48 animate-pulse rounded-lg bg-slate-800 mb-3" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800" />
              </div>
              <div className="mt-4 flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 w-20 animate-pulse rounded-full bg-slate-800" />
                ))}
              </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex gap-2 border-b border-white/5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 w-24 animate-pulse rounded-t-lg bg-slate-800" />
              ))}
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 animate-pulse rounded-2xl border border-white/5 bg-slate-900/50" />
                <div className="h-48 animate-pulse rounded-2xl border border-white/5 bg-slate-900/50" />
              </div>
              <div className="space-y-6">
                <div className="h-96 animate-pulse rounded-2xl border border-white/5 bg-slate-900/50" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="min-h-dvh bg-slate-950 text-slate-200">
        <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between p-4 px-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-6xl p-4 px-6 py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertTriangle className="h-16 w-16 text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              {error?.message?.includes("not found") ? "Repository Not Found" : "Failed to Analyze Repository"}
            </h2>
            <p className="text-slate-400 mb-6 max-w-md">
              {error?.message || "An unexpected error occurred while analyzing the repository."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BookOpen },
    { id: "architecture" as const, label: "Architecture", icon: Layers },
    { id: "dependencies" as const, label: "Dependencies", icon: Network },
    { id: "structure" as const, label: "File Structure", icon: FolderTree },
  ];

  return (
    <main className="min-h-dvh bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-50 animate-fade-in border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4 px-6 gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
              <Github className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-white sm:text-base">
                {data.owner} / <span className="text-violet-300">{data.name}</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-yellow-500" /> {formatNumber(data.stars)}
              </div>
              <div className="flex items-center gap-1.5">
                <GitFork className="h-4 w-4 text-blue-400" /> {formatNumber(data.forks)}
              </div>
            </div>
            <button
              onClick={handleCopyUrl}
              className="rounded-lg bg-slate-800 p-1.5 text-slate-400 transition-colors hover:text-white hover:bg-slate-700"
              title="Copy link"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-4 px-6 py-8">
        <div className="animate-fade-in space-y-6">
          {/* Overview Banner */}
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-2">Repository Overview</h2>
            <p className="text-slate-300 leading-relaxed mb-4">{data.description}</p>
            <div className="flex flex-wrap gap-2">
              {data.topics.slice(0, 8).map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 border border-violet-500/20"
                >
                  {topic}
                </span>
              ))}
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                {data.techStack.primaryLanguage}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
              <span>Default branch: <span className="text-slate-300 font-medium">{data.defaultBranch}</span></span>
              <span>•</span>
              <a
                href={`https://github.com/${data.fullName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors"
              >
                View on GitHub <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-white/5">
            <nav className="flex gap-1" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-violet-500 text-violet-400"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
                  }`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-fade-in">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Architecture Pattern */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Layers className="h-5 w-5 text-violet-400" />
                    <h3 className="text-lg font-bold text-white">Architecture Pattern</h3>
                  </div>
                  <p className="text-sm font-semibold text-violet-300 mb-2">{data.architecture.pattern}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{data.architecture.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.architecture.layers.map((layer) => (
                      <span
                        key={layer}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300"
                      >
                        <FolderOpen className="h-3 w-3" />
                        {layer}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Code2 className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">Technology Stack</h3>
                  </div>

                  {data.techStack.frameworks.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Frameworks</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.techStack.frameworks.map((fw) => (
                          <span key={fw} className="rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300 border border-blue-500/20">
                            {fw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.techStack.libraries.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Libraries</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.techStack.libraries.map((lib) => (
                          <span key={lib} className="rounded-md bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-300 border border-green-500/20">
                            {lib}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.techStack.tools.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tools & Config</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.techStack.tools.slice(0, 10).map((tool) => (
                          <span key={tool} className="rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 border border-amber-500/20">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Quick Architecture Preview */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Workflow className="h-5 w-5 text-green-400" />
                    <h3 className="text-lg font-bold text-white">Quick Architecture</h3>
                  </div>
                  <MermaidDiagram
                    definition={data.architecture.mermaidDiagram}
                    className="mb-4"
                  />
                  <button
                    onClick={() => setActiveTab("architecture")}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-600/20 px-3 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-600/30"
                  >
                    View Full Diagram <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Languages */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Languages</h3>
                  <div className="space-y-3">
                    {Object.entries(data.techStack.languages)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 6)
                      .map(([lang, pct]) => (
                        <div key={lang}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300">{lang}</span>
                            <span className="text-slate-500">{pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-blue-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "architecture" && (
            <div className="animate-fade-in space-y-6">
              {/* Main Architecture Diagram */}
              <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className="h-5 w-5 text-violet-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white">System Architecture</h3>
                      <p className="text-xs text-slate-400">{data.architecture.pattern}</p>
                    </div>
                  </div>
                </div>
                <MermaidDiagram definition={data.architecture.mermaidDiagram} />
              </div>

              {/* Component Flow */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Workflow className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">Component Flow</h3>
                  </div>
                  <MermaidDiagram definition={data.componentFlow.mermaidFlowchart} />
                </div>

                <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <GitMerge className="h-5 w-5 text-green-400" />
                    <h3 className="text-lg font-bold text-white">How It Works</h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{data.architecture.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Entry Points</h4>
                    {data.componentFlow.entryPoints.map((ep, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <ChevronRight className="h-3 w-3 text-violet-400" />
                        <code className="text-xs bg-slate-800 px-2 py-0.5 rounded">{ep}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "dependencies" && (
            <div className="animate-fade-in space-y-6">
              {/* Dependency Graph */}
              <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Network className="h-5 w-5 text-violet-400" />
                  <h3 className="text-lg font-bold text-white">Dependency Graph</h3>
                </div>
                <MermaidDiagram definition={data.dependencyGraph.mermaidGraph} />
              </div>

              {/* Dependencies Lists */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Dependencies <span className="text-slate-500 text-sm font-normal">({data.dependencyGraph.dependencies.length})</span>
                  </h3>
                  <div className="max-h-80 overflow-y-auto space-y-1">
                    {data.dependencyGraph.dependencies.map((dep) => (
                      <div
                        key={dep}
                        className="flex items-center gap-2 rounded-md bg-slate-800/50 px-3 py-1.5 text-sm text-slate-300"
                      >
                        <FileCode className="h-3 w-3 text-blue-400" />
                        {dep}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Dev Dependencies <span className="text-slate-500 text-sm font-normal">({data.dependencyGraph.devDependencies.length})</span>
                  </h3>
                  <div className="max-h-80 overflow-y-auto space-y-1">
                    {data.dependencyGraph.devDependencies.map((dep) => (
                      <div
                        key={dep}
                        className="flex items-center gap-2 rounded-md bg-slate-800/50 px-3 py-1.5 text-sm text-slate-300"
                      >
                        <FileCode className="h-3 w-3 text-amber-400" />
                        {dep}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "structure" && (
            <div className="animate-fade-in space-y-6">
              {/* Structure Summary */}
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
                <p className="text-sm text-slate-300 leading-relaxed">{data.structureSummary}</p>
              </div>

              {/* File Tree */}
              <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <FolderTree className="h-5 w-5 text-violet-400" />
                  <h3 className="text-lg font-bold text-white">Repository Structure</h3>
                </div>
                <div className="max-h-[600px] overflow-y-auto font-mono text-sm">
                  {renderFileTree(data.fileTree)}
                </div>
              </div>
            </div>
          )}

          {/* README Section (always shown at bottom) */}
          {data.readme && (
            <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
              <div className="mb-4 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">README</h3>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-slate-400 leading-relaxed font-sans">
                  {data.readme.slice(0, 2000)}
                  {data.readme.length > 2000 && "..."}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Helper to render file tree with icons
function renderFileTree(fileTree: { path: string; name: string; type: "file" | "dir" }[]) {
  const renderTree = (items: typeof fileTree, prefix = "") => {
    return items.map((item, index) => {
      const isLast = index === items.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const newPrefix = prefix + (isLast ? "    " : "│   ");

      // Only show top-level and first nested level
      const depth = item.path.split("/").length;
      if (depth > 3) return null;

      return (
        <div key={item.path} className="flex items-center py-0.5 text-slate-400 hover:text-slate-200 transition-colors">
          <span className="text-slate-600 select-none">{prefix}{connector}</span>
          {item.type === "dir" ? (
            <Folder className="h-3.5 w-3.5 text-violet-400 mr-1.5 flex-shrink-0" />
          ) : (
            <FileCode className="h-3.5 w-3.5 text-blue-400 mr-1.5 flex-shrink-0" />
          )}
          <span className={item.type === "dir" ? "text-violet-300 font-medium" : ""}>
            {item.name}
          </span>
        </div>
      );
    });
  };

  // Group by top-level directory
  const topLevel = fileTree.filter((f) => !f.path.includes("/"));
  const nested = fileTree.filter((f) => f.path.includes("/"));

  return (
    <div>
      {renderTree(topLevel)}
      {topLevel.length > 0 && nested.length > 0 && <div className="py-1" />}
      {renderTree(nested.slice(0, 150))}
    </div>
  );
}
