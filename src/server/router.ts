import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import superjson from "superjson";
import { fetchCompleteProfile } from "@/lib/github";
import { calculateDeveloperScore } from "@/lib/scoring";
import type { ProfileAnalysis } from "@/types";

const t = initTRPC.create({
    transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
    getProfile: publicProcedure
        .input(
            z.object({
                username: z
                    .string()
                    .min(1, "Username required")
                    .max(39, "Username too long")
                    .regex(
                        /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/,
                        "Invalid GitHub username"
                    ),
            })
        )
        .query(async ({ input }): Promise<ProfileAnalysis> => {
            try {
                const data = await fetchCompleteProfile(input.username);
                const developerScore = calculateDeveloperScore(data);

                const topRepos = [...data.repos]
                    .sort((a, b) => b.stargazers_count - a.stargazers_count)
                    .slice(0, 10);

                return {
                    user: data.user,
                    repos: data.repos,
                    topRepos,
                    languageDistribution: data.language_distribution,
                    activityHeatmap: data.activity_heatmap,
                    weeklyContributions: data.weekly_contributions,
                    developerScore,
                    totalStars: data.total_stars,
                    totalForks: data.total_forks,
                    commits30d: data.commits_30d,
                    prsMerged30d: data.prs_merged_30d,
                    issuesClosed30d: data.issues_closed_30d,
                };
            } catch (err) {
                if (err instanceof Error) {
                    if (err.message === "USER_NOT_FOUND") {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: `GitHub user "${input.username}" not found.`,
                        });
                    }
                    if (err.message === "RATE_LIMITED") {
                        throw new TRPCError({
                            code: "TOO_MANY_REQUESTS",
                            message:
                                "GitHub API rate limit reached. Please add a GITHUB_TOKEN or try again later.",
                        });
                    }
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch GitHub profile. Please try again.",
                });
            }
        }),

    compareProfiles: publicProcedure
        .input(
            z.object({
                usernameA: z.string().min(1).max(39),
                usernameB: z.string().min(1).max(39),
            })
        )
        .query(async ({ input }) => {
            const [left, right] = await Promise.all([
                fetchCompleteProfile(input.usernameA).then((data) => ({
                    user: data.user,
                    repos: data.repos,
                    topRepos: [...data.repos]
                        .sort((a, b) => b.stargazers_count - a.stargazers_count)
                        .slice(0, 10),
                    languageDistribution: data.language_distribution,
                    activityHeatmap: data.activity_heatmap,
                    weeklyContributions: data.weekly_contributions,
                    developerScore: calculateDeveloperScore(data),
                    totalStars: data.total_stars,
                    totalForks: data.total_forks,
                    commits30d: data.commits_30d,
                    prsMerged30d: data.prs_merged_30d,
                    issuesClosed30d: data.issues_closed_30d,
                })),
                fetchCompleteProfile(input.usernameB).then((data) => ({
                    user: data.user,
                    repos: data.repos,
                    topRepos: [...data.repos]
                        .sort((a, b) => b.stargazers_count - a.stargazers_count)
                        .slice(0, 10),
                    languageDistribution: data.language_distribution,
                    activityHeatmap: data.activity_heatmap,
                    weeklyContributions: data.weekly_contributions,
                    developerScore: calculateDeveloperScore(data),
                    totalStars: data.total_stars,
                    totalForks: data.total_forks,
                    commits30d: data.commits_30d,
                    prsMerged30d: data.prs_merged_30d,
                    issuesClosed30d: data.issues_closed_30d,
                })),
            ]);

            return { left, right };
        }),
});

export type AppRouter = typeof appRouter;
