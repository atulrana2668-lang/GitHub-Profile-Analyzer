"use client";

import Link from "next/link";
import { Star, GitFork, ExternalLink } from "lucide-react";
import type { GitHubRepo } from "@/types";
import { formatNumber, formatRelativeTime, getLanguageColor } from "@/lib/utils";

interface RepoTableProps {
    repos: GitHubRepo[];
}

export function RepoTable({ repos }: RepoTableProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-xl">
            <div className="border-b border-white/5 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">Top Repositories</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Sorted by stars · Excluding forks
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/5 text-xs text-slate-500">
                            <th className="px-6 py-3 text-left font-medium">REPOSITORY</th>
                            <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">
                                LANGUAGE
                            </th>
                            <th className="px-4 py-3 text-right font-medium">⭐</th>
                            <th className="px-4 py-3 text-right font-medium hidden md:table-cell">
                                🍴
                            </th>
                            <th className="px-4 py-3 text-right font-medium hidden lg:table-cell">
                                UPDATED
                            </th>
                            <th className="px-4 py-3 text-center font-medium">LINK</th>
                        </tr>
                    </thead>
                    <tbody>
                        {repos.map((repo, i) => (
                            <tr
                                key={repo.id}
                                className="group border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                            >
                                {/* Name + description */}
                                <td className="px-6 py-4">
                                    <div>
                                        <span className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                                            {repo.name}
                                        </span>
                                        {repo.description && (
                                            <p className="mt-0.5 text-xs text-slate-500 line-clamp-1 max-w-xs">
                                                {repo.description}
                                            </p>
                                        )}
                                        {repo.topics.length > 0 && (
                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                                {repo.topics.slice(0, 3).map((t) => (
                                                    <span
                                                        key={t}
                                                        className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-400 border border-violet-500/20"
                                                    >
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* Language */}
                                <td className="px-4 py-4 hidden sm:table-cell">
                                    {repo.language ? (
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor: getLanguageColor(repo.language),
                                                }}
                                            />
                                            <span className="text-slate-300 text-xs">{repo.language}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-600 text-xs">—</span>
                                    )}
                                </td>

                                {/* Stars */}
                                <td className="px-4 py-4 text-right">
                                    <span className="flex items-center justify-end gap-1 text-yellow-400">
                                        <Star className="h-3 w-3 fill-yellow-400" />
                                        <span className="text-xs font-semibold">
                                            {formatNumber(repo.stargazers_count)}
                                        </span>
                                    </span>
                                </td>

                                {/* Forks */}
                                <td className="px-4 py-4 text-right hidden md:table-cell">
                                    <span className="flex items-center justify-end gap-1 text-slate-400">
                                        <GitFork className="h-3 w-3" />
                                        <span className="text-xs">
                                            {formatNumber(repo.forks_count)}
                                        </span>
                                    </span>
                                </td>

                                {/* Updated */}
                                <td className="px-4 py-4 text-right text-xs text-slate-500 hidden lg:table-cell">
                                    {formatRelativeTime(repo.pushed_at)}
                                </td>

                                {/* Link */}
                                <td className="px-4 py-4 text-center">
                                    <a
                                        href={repo.html_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={`Open ${repo.name} on GitHub`}
                                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:bg-violet-500/20 hover:text-violet-400 hover:border-violet-500/30"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {repos.length === 0 && (
                    <div className="py-12 text-center text-slate-500">
                        No public repositories found.
                    </div>
                )}
            </div>
        </div>
    );
}
