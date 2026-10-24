import type { MetadataRoute } from "next";
import { getSiteConfiguration } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteConfiguration();
  return site.indexable && site.url
    ? { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: new URL("/sitemap.xml", site.url).href }
    : { rules: { userAgent: "*", disallow: "/" } };
}
