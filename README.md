# 🚀 GitHub Profile Analyzer

> **Developer Score™** & deep GitHub profile insights — built with Next.js 14, tRPC v11, and Chart.js

![Tech Stack](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript) ![tRPC](https://img.shields.io/badge/tRPC-v11-2596be) ![Tailwind](https://img.shields.io/badge/Tailwind-v3.4-06B6D4?logo=tailwindcss)

---

## ✨ Features

| Feature | Details |
|---|---|
| **Developer Score™** | 0–100 algorithmic score (followers, stars, forks, commit velocity, PRs) |
| **Language Chart** | Doughnut chart of top 8 languages with percentage breakdown |
| **Activity Heatmap** | 90-day GitHub-style contribution grid |
| **Top Repos Table** | Sorted by stars — name, language, stars, forks, last updated |
| **Quick Stats** | Commits (30d), PRs merged, issues closed, total forks |
| **Profile Card** | Avatar, bio, links, company, location, joined date |
| **Share** | Copy-to-clipboard profile link |
| **Dark Theme** | Full dark mode with violet accent |

---

## 🛠 Stack

```
Next.js 14 (App Router) + TypeScript + tRPC v11
TanStack Query v5 · Zod · Chart.js + react-chartjs-2
Tailwind CSS v3 · Lucide Icons · superjson
GitHub REST API v3
```

---

## 🚀 Quick Start

```bash
cd github-profile-analyzer
npm install --legacy-peer-deps
npm run dev
# Open http://localhost:3000
```

### With GitHub Token (higher rate limits)

```bash
# Create .env.local
echo "GITHUB_TOKEN=ghp_your_token_here" > .env.local
npm run dev
```

---

## 🌐 Deploy to Vercel

```bash
npx vercel --prod
# Set GITHUB_TOKEN env variable in Vercel dashboard
```

Or click: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout + providers
│   ├── globals.css                 # Global styles
│   ├── profile/[[...username]]/    # Dynamic profile page
│   └── api/trpc/[trpc]/            # tRPC API handler
├── components/
│   ├── profile-card.tsx            # User info card
│   ├── repo-table.tsx              # Repository table
│   ├── language-pie.tsx            # Doughnut chart
│   ├── activity-heatmap.tsx        # 90-day heatmap
│   ├── score-gauge.tsx             # SVG arc gauge
│   └── providers/trpc-provider.tsx # tRPC + React Query
├── lib/
│   ├── github.ts                   # GitHub API client
│   ├── scoring.ts                  # Developer Score™ algorithm
│   ├── trpc.ts                     # tRPC client
│   └── utils.ts                    # Utilities
├── server/
│   └── router.ts                   # tRPC server router
└── types/
    └── index.ts                    # TypeScript definitions
```

---

## 🧮 Developer Score™ Formula

```typescript
score = (
  log10(followers + 1) * 8 +   // Influence (log scale)
  total_stars * 0.3 +           // Popularity
  total_forks * 0.15 +          // Code quality signal
  public_repos * 0.8 +          // Productivity
  commits_30d * 0.05 +          // Current velocity
  prs_merged_30d * 0.1 +        // Impact
  min(following/followers, 2)*5  // Networking ratio
) / 2
```

Grade: **S** (90+) → **A** (75+) → **B** (55+) → **C** (35+) → **D** (15+) → **F**

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | Optional | GitHub Personal Access Token (increases rate limit from 60 to 5000 req/hr) |

---

## 📊 Performance

| Metric | Value |
|---|---|
| GitHub API calls per profile | ≤ 3 (profile + repos + events) |
| Next.js cache (revalidate) | 900s (15 min) |
| Landing bundle | 91.3 kB |
| Profile bundle | 190 kB |

---

## 🧪 Test Profiles

```bash
# Linus Torvalds
http://localhost:3000/profile/torvalds

# Sindre Sorhus  
http://localhost:3000/profile/sindresorhus
```
Deployment trigger update
