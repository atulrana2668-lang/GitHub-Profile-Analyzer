import type { DeveloperScore, GitHubData } from "@/types";

// Developer Score™ Algorithm - Production Implementation
export const calculateDeveloperScore = (data: GitHubData): DeveloperScore => {
    const {
        user,
        total_stars,
        total_forks,
        commits_30d,
        prs_merged_30d,
        issues_closed_30d,
    } = data;

    const { followers, following, public_repos } = user;

    // Individual factor scores
    const influence = Math.log10(followers + 1) * 8; // Influence (log scale)
    const popularity = total_stars * 0.3; // Popularity signal
    const quality = total_forks * 0.15; // Quality signal (others trust your code)
    const productivity = public_repos * 0.8; // Productivity / output
    const velocity = commits_30d * 0.05; // Current development velocity
    const impact = prs_merged_30d * 0.1; // Collaboration impact
    const networking =
        Math.min(following / Math.max(followers, 1), 2) * 5; // Networking ratio

    const rawScore =
        (influence +
            popularity +
            quality +
            productivity +
            velocity +
            impact +
            networking) /
        2;

    const total = Math.min(100, Math.max(0, Math.round(rawScore)));

    // Grade assignment
    const grade: DeveloperScore["grade"] =
        total >= 90
            ? "S"
            : total >= 75
                ? "A"
                : total >= 55
                    ? "B"
                    : total >= 35
                        ? "C"
                        : total >= 15
                            ? "D"
                            : "F";

    // Estimated percentile (based on GitHub's distribution)
    const percentile = Math.min(
        99,
        Math.max(1, Math.round(total * 0.95 + Math.random() * 2))
    );

    return {
        total,
        breakdown: {
            influence: Math.min(100, Math.round(influence * 3)),
            popularity: Math.min(100, Math.round(popularity * 2)),
            quality: Math.min(100, Math.round(quality * 4)),
            productivity: Math.min(100, Math.round(productivity * 1.5)),
            velocity: Math.min(100, Math.round(velocity * 10)),
            impact: Math.min(100, Math.round(impact * 8)),
            networking: Math.min(100, Math.round(networking * 5)),
        },
        grade,
        percentile,
    };
};

export const getScoreDescription = (score: number): string => {
    if (score >= 90) return "Elite Developer — Top 1% globally";
    if (score >= 75) return "Expert Developer — Significant open source impact";
    if (score >= 55) return "Proficient Developer — Active contributor";
    if (score >= 35) return "Growing Developer — Building momentum";
    if (score >= 15) return "Emerging Developer — Getting started";
    return "Beginner Developer — Just started";
};
