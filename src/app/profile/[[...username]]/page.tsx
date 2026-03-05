"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Github, Share2, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { ProfileCard } from "@/components/profile-card";
import { RepoTable } from "@/components/repo-table";
import { LanguagePie } from "@/components/language-pie";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { ScoreGauge } from "@/components/score-gauge";

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    // Extract username from catch-all route
    const username = Array.isArray(params.username)
        ? params.username[0]
        : params.username ?? "";

    const { data, isLoading, isError, error, refetch } =
        trpc.getProfile.useQuery(
            { username },
            {
                enabled: !!username,
                retry: false,
            }
        );

    async function copyLink() {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    if (!username) {
        router.push("/");
        return null;
    }

    return (
        <div className="relative min-h-dvh bg-mesh">
            {/* Ambient glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
                <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-violet-700/10 blur-[120px]" />
                <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-blue-700/8 blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <Github className="h-4 w-4 text-violet-400" />
                        <span className="font-semibold text-white">Profile Analyzer</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => refetch()}
                            aria-label="Refresh data"
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-white/5 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={copyLink}
                            aria-label="Copy profile link"
                            className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition-all hover:bg-white/10 hover:text-white"
                        >
                            <Share2 className="h-3.5 w-3.5" />
                            {copied ? "Copied!" : "Share"}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative mx-auto max-w-6xl px-4 py-8 space-y-6">
                {/* Loading state */}
                {isLoading && <ProfileSkeleton />}

                {/* Error state */}
                {isError && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                            <Github className="h-8 w-8 text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            {error?.message?.includes("not found")
                                ? `@${username} not found`
                                : "Failed to load profile"}
                        </h2>
                        <p className="text-sm text-slate-500 max-w-sm mb-6">
                            {error?.message?.includes("rate limit")
                                ? "GitHub API rate limit reached. Add a GITHUB_TOKEN env variable or wait a minute."
                                : error?.message ?? "Please check the username and try again."}
                        </p>
                        <Link
                            href="/"
                            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
                        >
                            Try Another Profile
                        </Link>
                    </div>
                )}

                {/* Data loaded */}
                {data && (
                    <>
                        {/* Profile Card */}
                        <div className="animate-fade-up">
                            <ProfileCard analysis={data} />
                        </div>

                        {/* Score + Language row */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-up-delay-1">
                            <ScoreGauge score={data.developerScore} />
                            <LanguagePie distribution={data.languageDistribution} />
                        </div>

                        {/* Activity Heatmap */}
                        <div className="animate-fade-up-delay-2">
                            <ActivityHeatmap data={data.activityHeatmap} />
                        </div>

                        {/* Quick stats */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 animate-fade-up-delay-2">
                            {[
                                {
                                    label: "Commits (30d)",
                                    value: data.commits30d,
                                    color: "text-violet-400",
                                },
                                {
                                    label: "PRs Merged (30d)",
                                    value: data.prsMerged30d,
                                    color: "text-emerald-400",
                                },
                                {
                                    label: "Issues Closed (30d)",
                                    value: data.issuesClosed30d,
                                    color: "text-blue-400",
                                },
                                {
                                    label: "Total Forks",
                                    value: data.totalForks,
                                    color: "text-orange-400",
                                },
                            ].map(({ label, value, color }) => (
                                <div
                                    key={label}
                                    className="rounded-2xl border border-white/5 bg-slate-900/80 p-5 text-center"
                                >
                                    <p className={`text-3xl font-black ${color}`}>
                                        {value}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Repo Table */}
                        <div className="animate-fade-up-delay-3">
                            <RepoTable repos={data.topRepos} />
                        </div>

                        {/* Footer */}
                        <p className="text-center text-xs text-slate-700 pb-4">
                            Data sourced from GitHub REST API v3 · Cached 15 minutes ·{" "}
                            <Link href="/" className="hover:text-slate-500 transition-colors">
                                Analyze another
                            </Link>
                        </p>
                    </>
                )}
            </main>
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Profile card skeleton */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/80 p-6">
                <div className="flex gap-5">
                    <div className="h-24 w-24 rounded-2xl shimmer" />
                    <div className="flex-1 space-y-3 pt-2">
                        <div className="h-6 w-48 rounded-lg shimmer" />
                        <div className="h-4 w-32 rounded shimmer" />
                        <div className="h-3 w-64 rounded shimmer" />
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-16 rounded-xl shimmer" />
                    ))}
                </div>
            </div>
            {/* Two col skeleton */}
            <div className="grid grid-cols-2 gap-6">
                <div className="h-56 rounded-2xl shimmer" />
                <div className="h-56 rounded-2xl shimmer" />
            </div>
            {/* Heatmap skeleton */}
            <div className="h-40 rounded-2xl shimmer" />
            {/* Table skeleton */}
            <div className="h-64 rounded-2xl shimmer" />
        </div>
    );
}
