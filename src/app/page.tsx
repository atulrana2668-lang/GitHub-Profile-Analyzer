"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Github,
  Search,
  Zap,
  BarChart2,
  Map,
  Award,
  BookOpen,
  Cpu,
  Layers,
  Code2
} from "lucide-react";
import { parseGitHubUrl, parseGitHubRepoUrl } from "@/lib/utils";

const POPULAR_PROFILES = ["torvalds", "sindresorhus", "gaearon", "yyx990803", "tj"];
const POPULAR_REPOS = [
  "facebook/react",
  "vercel/next.js",
  "torvalds/linux",
  "openclaw/openclaw",
  "langchain-ai/langchain",
];

const PROFILE_FEATURES = [
  {
    icon: Award,
    title: "Developer Score™",
    desc: "0–100 algorithmic score based on impact, velocity, and influence",
  },
  {
    icon: BarChart2,
    title: "Language Analytics",
    desc: "Beautiful pie chart of your language distribution across repos",
  },
  {
    icon: Map,
    title: "Activity Heatmap",
    desc: "90-day contribution heatmap with daily event counts",
  },
  {
    icon: Zap,
    title: "Instant Insights",
    desc: "Deep repo analysis: stars, forks, topics, and live rankings",
  },
];

const REPO_FEATURES = [
  {
    icon: Cpu,
    title: "Architecture Diagrams",
    desc: "Auto-generated Mermaid flowcharts showing system architecture and component relationships",
  },
  {
    icon: Layers,
    title: "Tech Stack Detection",
    desc: "Automatic identification of frameworks, libraries, and build tools used in the repository",
  },
  {
    icon: Code2,
    title: "Dependency Graph",
    desc: "Visual representation of all dependencies and dev dependencies with interactive graphs",
  },
  {
    icon: BookOpen,
    title: "Code Walkthrough",
    desc: "Complete repository walkthrough with file structure, entry points, and architecture patterns",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"profile" | "repo">("profile");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === "profile") {
      const username = parseGitHubUrl(input);
      if (!username) {
        setError("Enter a valid GitHub username or profile URL");
        return;
      }
      setError("");
      router.push(`/profile/${username}`);
    } else {
      const parsedRepo = parseGitHubRepoUrl(input);
      if (!parsedRepo) {
        setError("Enter a valid GitHub repository (e.g., facebook/react)");
        return;
      }
      setError("");
      router.push(`/repo/${parsedRepo.owner}/${parsedRepo.repo}`);
    }
  }

  const activeFeatures = mode === "profile" ? PROFILE_FEATURES : REPO_FEATURES;
  const activePopular = mode === "profile" ? POPULAR_PROFILES : POPULAR_REPOS;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-mesh">
      {/* Background circles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute -right-32 top-1/2 h-96 w-96 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-violet-800/10 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-20 sm:py-28">
        {/* Eyebrow */}
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5">
          <Github className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-xs font-medium text-violet-300">
            GitHub {mode === "profile" ? "Profile" : "Repository"} Analyzer
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-center text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl md:text-7xl transition-all">
          {mode === "profile" ? (
            <>
              Know your{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-violet-300 bg-clip-text text-transparent">
                Developer Score™
              </span>
            </>
          ) : (
            <>
              Understand{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-violet-300 bg-clip-text text-transparent">
                Any Codebase
              </span>
            </>
          )}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-center text-base text-slate-400 sm:text-lg">
          {mode === "profile"
            ? "Deep-dive into any GitHub profile. Instant insights on activity, language mastery, repositories, and your global ranking."
            : "Enter any public repository name. Get interactive Mermaid diagrams showing architecture, dependencies, and complete code walkthroughs."}
        </p>

        {/* Mode Toggle */}
        <div className="mx-auto mt-8 flex justify-center">
          <div className="flex rounded-full bg-slate-800/50 p-1 border border-white/5 backdrop-blur-sm">
            <button
              onClick={() => { setMode("profile"); setError(""); setInput(""); }}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                mode === "profile" 
                  ? "bg-violet-500/20 text-violet-300 shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Developer Profile
            </button>
            <button
              onClick={() => { setMode("repo"); setError(""); setInput(""); }}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                mode === "repo" 
                  ? "bg-violet-500/20 text-violet-300 shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Repository Architecture
            </button>
          </div>
        </div>

        {/* Search form */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Github className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              placeholder={mode === "profile" ? "github.com/username or @username" : "facebook/react or github.com/facebook/react"}
              aria-label={mode === "profile" ? "GitHub username or profile URL" : "GitHub repository string or URL"}
              className="w-full rounded-xl border border-white/10 bg-slate-800/80 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 backdrop-blur-sm outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:from-violet-500 hover:to-violet-400 hover:shadow-violet-500/30 active:scale-95 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          >
            <Search className="h-4 w-4" />
            Analyze
          </button>
        </form>

        {error && (
          <p className="mt-2 text-center text-xs text-red-400">{error}</p>
        )}

        {/* Popular profiles/repos */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-slate-600">Try:</span>
          {activePopular.map((u) => (
            <button
              key={u}
              onClick={() => {
                setInput(u);
                if (mode === "profile") {
                  router.push(`/profile/${u}`);
                } else {
                  const parsed = parseGitHubRepoUrl(u);
                  if (parsed) router.push(`/repo/${parsed.owner}/${parsed.repo}`);
                }
              }}
              className="rounded-full border border-white/5 bg-slate-800/60 px-3 py-1 text-xs text-slate-400 transition-colors hover:border-violet-500/30 hover:text-violet-400"
            >
              {mode === "profile" ? "@" : ""}{u}
            </button>
          ))}
        </div>

        {/* Feature grid */}
        <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {activeFeatures.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className={`group rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-sm transition-all hover:border-violet-500/20 hover:bg-slate-900/80 animate-fade-up`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                <Icon className="h-5 w-5 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA footer */}
        <div className="mt-16 text-center">
          <p className="text-xs text-slate-600">
            Uses GitHub REST API v3 · No account required · 100% open source
          </p>
        </div>
      </div>
    </main>
  );
}
