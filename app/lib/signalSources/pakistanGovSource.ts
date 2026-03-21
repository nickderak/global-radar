import type {
  ExternalSignal,
  SignalSource,
  SignalSourceResult,
} from "./types";

function cleanText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractArticleBlocks(html: string) {
  const matches = html.match(
    /<article[\s\S]*?<\/article>|<div[\s\S]*?class="[^"]*post[^"]*"[\s\S]*?<\/div>/gi
  );

  return matches ?? [];
}

function extractHref(block: string) {
  const match = block.match(/href="([^"]+)"/i);
  return match ? match[1] : "";
}

function extractTitle(block: string) {
  const headingMatch = block.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
  if (headingMatch) return cleanText(headingMatch[1]);

  const linkMatch = block.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
  if (linkMatch) return cleanText(linkMatch[1]);

  return "Pakistan government update";
}

function extractDate(block: string) {
  const timeMatch = block.match(/<time[^>]*>([\s\S]*?)<\/time>/i);
  if (timeMatch) return cleanText(timeMatch[1]);

  const dateMatch = block.match(
    /\b(\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{1,2}\s+[A-Za-z]+\s*,?\s*\d{4})\b/i
  );

  return dateMatch ? cleanText(dateMatch[1]) : new Date().toISOString();
}

function extractDescription(block: string) {
  const paragraphMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  return paragraphMatch ? cleanText(paragraphMatch[1]) : "";
}

function normalizeLink(link: string) {
  if (!link) return "https://mofa.gov.pk/press-releases";
  if (link.startsWith("http")) return link;
  if (link.startsWith("/")) return `https://mofa.gov.pk${link}`;
  return `https://mofa.gov.pk/${link}`;
}

function buildSignal(
  title: string,
  description: string,
  link: string,
  timestamp: string
): ExternalSignal {
  return {
    source: "Pakistan Government",
    sourceType: "Government",
    title,
    description: description || "Pakistan government press release.",
    timestamp: new Date(timestamp).toISOString(),
    category: "Geopolitics",
    region: "South Asia",
    country: "Pakistan",
    locationLabel: "Pakistan",
    actors: ["Government of Pakistan"],
    keywords: ["pakistan", "government", "foreign policy", "diplomacy"],
    rawUrl: normalizeLink(link),
    confidenceSeed: "High",
  };
}

async function fetchPage(url: string) {
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "GlobalRadar/1.0",
    },
  });

  if (!res.ok) {
    throw new Error(`Pakistan government page failed: ${res.status}`);
  }

  return res.text();
}

export const pakistanGovSource: SignalSource = {
  key: "pakistan-government",
  displayName: "Pakistan Government",

  async fetchSignals(): Promise<SignalSourceResult> {
    const html = await fetchPage("https://mofa.gov.pk/press-releases");
    const blocks = extractArticleBlocks(html);

    const signals: ExternalSignal[] = blocks.slice(0, 10).map((block) => {
      const title = extractTitle(block);
      const description = extractDescription(block);
      const link = extractHref(block);
      const published = extractDate(block);

      return buildSignal(title, description, link, published);
    });

    return {
      sourceKey: "pakistan-government",
      fetchedCount: signals.length,
      signals,
    };
  },
};