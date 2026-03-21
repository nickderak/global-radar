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
    /<article[\s\S]*?<\/article>|<li[\s\S]*?<\/li>/gi
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

  return "Mexico government update";
}

function extractDate(block: string) {
  const timeMatch = block.match(/<time[^>]*>([\s\S]*?)<\/time>/i);
  if (timeMatch) return cleanText(timeMatch[1]);

  const dateMatch = block.match(
    /\b(\d{1,2}\s+de\s+[A-Za-z]+\s+de\s+\d{4}|\d{4}-\d{2}-\d{2})\b/i
  );

  return dateMatch ? cleanText(dateMatch[1]) : new Date().toISOString();
}

function extractDescription(block: string) {
  const paragraphMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  return paragraphMatch ? cleanText(paragraphMatch[1]) : "";
}

function normalizeLink(link: string) {
  if (!link) return "https://www.gob.mx/sre/archivo/prensa";
  if (link.startsWith("http")) return link;
  if (link.startsWith("/")) return `https://www.gob.mx${link}`;
  return `https://www.gob.mx/${link}`;
}

function buildSignal(
  title: string,
  description: string,
  link: string,
  timestamp: string
): ExternalSignal {
  return {
    source: "Mexico Government",
    sourceType: "Government",
    title,
    description: description || "Mexico government foreign affairs update.",
    timestamp: new Date(timestamp).toISOString(),
    category: "Geopolitics",
    region: "North America",
    country: "Mexico",
    locationLabel: "Mexico",
    actors: ["Government of Mexico"],
    keywords: ["mexico", "government", "foreign affairs", "diplomacy"],
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
    throw new Error(`Mexico government page failed: ${res.status}`);
  }

  return res.text();
}

export const mexicoGovSource: SignalSource = {
  key: "mexico-government",
  displayName: "Mexico Government",

  async fetchSignals(): Promise<SignalSourceResult> {
    const html = await fetchPage("https://www.gob.mx/sre/archivo/prensa");
    const blocks = extractArticleBlocks(html);

    const signals: ExternalSignal[] = blocks.slice(0, 10).map((block) => {
      const title = extractTitle(block);
      const description = extractDescription(block);
      const link = extractHref(block);
      const published = extractDate(block);

      return buildSignal(title, description, link, published);
    });

    return {
      sourceKey: "mexico-government",
      fetchedCount: signals.length,
      signals,
    };
  },
};