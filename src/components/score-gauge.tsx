"use client";

import type { DeveloperScore } from "@/types";
import { getGradeColor } from "@/lib/utils";

interface ScoreGaugeProps {
    score: DeveloperScore;
}

const FACTOR_LABELS: Record<keyof DeveloperScore["breakdown"], string> = {
    influence: "Influence",
    popularity: "Popularity",
    quality: "Code Quality",
    productivity: "Productivity",
    velocity: "Velocity",
    impact: "Impact",
    networking: "Networking",
};

export function ScoreGauge({ score }: ScoreGaugeProps) {
    const gradeColor = getGradeColor(score.grade);
    const circumference = 2 * Math.PI * 54;
    const dashOffset = circumference - (score.total / 100) * circumference;

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Developer Score™</h2>

            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                {/* SVG Gauge */}
                <div className="relative shrink-0 h-36 w-36">
                    <svg
                        viewBox="0 0 120 120"
                        className="h-full w-full -rotate-90"
                        aria-label={`Developer score: ${score.total}/100`}
                    >
                        {/* Track */}
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="10"
                            strokeLinecap="round"
                        />
                        {/* Progress */}
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="url(#scoreGradient)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#a78bfa" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white">{score.total}</span>
                        <span className={`text-xs font-bold ${gradeColor}`}>
                            Grade {score.grade}
                        </span>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="flex-1 w-full space-y-2.5">
                    {(
                        Object.entries(score.breakdown) as [
                            keyof DeveloperScore["breakdown"],
                            number
                        ][]
                    ).map(([key, val]) => (
                        <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-400">
                                    {FACTOR_LABELS[key]}
                                </span>
                                <span className="text-xs font-semibold text-slate-300">
                                    {Math.min(val, 100)}
                                </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-700"
                                    style={{ width: `${Math.min(val, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
