import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { portfolio } from "@/data/portfolio";
import { getSiteConfiguration } from "@/lib/site";

import "./globals.css";
import "./studio.css";
import "./portfolio.css";

const site = getSiteConfiguration();
const title = `${portfolio.name} | n8n Automation Specialist`;
const description = "Independent n8n automation specialist building dependable workflows for lead operations, connected data, onboarding, and reporting.";

export const metadata: Metadata = {
  metadataBase: site.url ?? new URL("http://localhost:3000"),
  title: {
    default: title,
    template: `%s | ${portfolio.name}`,
  },
  authors: [{ name: portfolio.name }],
  description,
  alternates: site.url ? { canonical: site.url.href } : undefined,
  robots: { index: site.indexable, follow: site.indexable },
  openGraph: { title, description, siteName: portfolio.name, type: "website", locale: "en_IN", ...(site.url ? { url: site.url.href } : {}) },
  twitter: { card: "summary_large_image", title, description, images: [{ url: "/opengraph-image", alt: `${portfolio.name} — n8n automations` }] },
};

export const viewport: Viewport = { themeColor: "#0c0e12", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
