import type { MetadataRoute } from "next";
import { getSiteConfiguration } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteConfiguration();
  return site.indexable && site.url ? [{ url: site.url.href, changeFrequency: "monthly", priority: 1 }] : [];
}
