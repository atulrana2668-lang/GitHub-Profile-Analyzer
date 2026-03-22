import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/components/providers/trpc-provider";

export const metadata: Metadata = {
  title: {
    default: "GitHub Profile Analyzer — Developer Score & Insights",
    template: "%s | GitHub Profile Analyzer",
  },
  description:
    "Get your Developer Score™, analyze your GitHub repositories, language stats, activity heatmap, and compare with other developers.",
  keywords: ["github", "developer", "profile", "analyzer", "stats", "score"],
  authors: [{ name: "GitHub Profile Analyzer" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "GitHub Profile Analyzer",
    description: "Developer Score™ & deep GitHub profile insights",
    siteName: "GitHub Profile Analyzer",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Profile Analyzer",
    description: "Developer Score™ & deep GitHub profile insights",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#8b5cf6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-dvh antialiased">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
