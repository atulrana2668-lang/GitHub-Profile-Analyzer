"use client";

import Image from "next/image";
import Link from "next/link";
import {
    MapPin,
    Link2,
    Twitter,
    Building2,
    Users,
    BookOpen,
    Calendar,
    Star,
    GitFork,
} from "lucide-react";
import type { ProfileAnalysis } from "@/types";
import { formatNumber, formatDate, getGradeColor, getGradeGlow } from "@/lib/utils";
import { getScoreDescription } from "@/lib/scoring";

interface ProfileCardProps {
    analysis: ProfileAnalysis;
}

export function ProfileCard({ analysis }: ProfileCardProps) {
    const { user, developerScore, totalStars, totalForks } = analysis;
    const gradeColor = getGradeColor(developerScore.grade);
    const gradeGlow = getGradeGlow(developerScore.grade);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-6 shadow-2xl backdrop-blur-xl">
            {/* Ambient glow top-right */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />

            {/* Header row */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <Image
                        src={user.avatar_url}
                        alt={user.login}
                        width={96}
                        height={96}
                        className="rounded-2xl border-2 border-white/10 shadow-xl"
                        priority
                    />
                    {/* Online indicator */}
                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-900 bg-green-400 shadow" />
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-white">
                            {user.name ?? user.login}
                        </h1>
                        {/* Developer Score Badge */}
                        <div
                            className={`flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-800/80 px-3 py-1 shadow-lg ${gradeGlow} shadow`}
                        >
                            <span className={`text-sm font-black ${gradeColor}`}>
                                {developerScore.grade}
                            </span>
                            <span className="text-xs text-slate-400">
                                {developerScore.total}/100
                            </span>
                        </div>
                    </div>

                    <p className="text-slate-400">
                        <Link
                            href={user.html_url}
                            target="_blank"
                            className="hover:text-violet-400 transition-colors"
                        >
                            @{user.login}
                        </Link>
                    </p>

                    {user.bio && (
                        <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-lg">
                            {user.bio}
                        </p>
                    )}

                    {/* Meta links */}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
                        {user.company && (
                            <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {user.company}
                            </span>
                        )}
                        {user.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {user.location}
                            </span>
                        )}
                        {user.blog && (
                            <a
                                href={
                                    user.blog.startsWith("http") ? user.blog : `https://${user.blog}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 hover:text-violet-400 transition-colors"
                            >
                                <Link2 className="h-3 w-3" />
                                {user.blog}
                            </a>
                        )}
                        {user.twitter_username && (
                            <a
                                href={`https://twitter.com/${user.twitter_username}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 hover:text-sky-400 transition-colors"
                            >
                                <Twitter className="h-3 w-3" />@{user.twitter_username}
                            </a>
                        )}
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined {formatDate(user.created_at)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    {
                        icon: Users,
                        label: "Followers",
                        value: formatNumber(user.followers),
                        color: "text-violet-400",
                    },
                    {
                        icon: Users,
                        label: "Following",
                        value: formatNumber(user.following),
                        color: "text-blue-400",
                    },
                    {
                        icon: BookOpen,
                        label: "Repos",
                        value: formatNumber(user.public_repos),
                        color: "text-emerald-400",
                    },
                    {
                        icon: Star,
                        label: "Total Stars",
                        value: formatNumber(totalStars),
                        color: "text-yellow-400",
                    },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div
                        key={label}
                        className="rounded-xl border border-white/5 bg-slate-800/60 p-3 text-center transition-all hover:border-white/10"
                    >
                        <Icon className={`mx-auto mb-1 h-4 w-4 ${color}`} />
                        <p className="text-lg font-bold text-white">{value}</p>
                        <p className="text-xs text-slate-500">{label}</p>
                    </div>
                ))}
            </div>

            {/* Score description */}
            <div className="mt-4 rounded-xl border border-white/5 bg-slate-800/40 px-4 py-2.5">
                <p className="text-center text-xs text-slate-400">
                    <span className={`font-semibold ${gradeColor}`}>
                        {getScoreDescription(developerScore.total)}
                    </span>{" "}
                    · Top {100 - developerScore.percentile}% on GitHub
                </p>
            </div>
        </div>
    );
}
