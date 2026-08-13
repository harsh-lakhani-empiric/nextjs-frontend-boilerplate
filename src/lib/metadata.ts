import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

type BuildMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
};

/** Builds a consistent Metadata object so pages don't hand-roll title/OG/Twitter tags each time. */
export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const { title, description = siteConfig.description, path = "/", noIndex = false } = options;
  const url = new URL(path, siteConfig.url).toString();

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
