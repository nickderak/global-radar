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
    /<li[\s\S]*?<\/li>|<div[\s\S]*?class="[^"]*news[^"]*"[\s\S]*?<\/div>/gi
  );

  return matches ?? [];
}

function extractHref(block: string) {
  const match = block.match(/href="([^"]+)"/i);
  return match ? match[1] : "";
}

function extractTitle(block: string) {
  const headingMatch = block.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
  if (headingMatch) return cleanText(headingMatch[1]);

  return "China government update";
}

function extractDate(block: string) {
  const dateMatch = block.match(
    /\b(\d{4}-\d{2}-\d{2}|\d{4}\/\d{2}\/\d{2})\b/
  );

  return dateMatch ? cleanText(dateMatch[1]) : new Date().toISOString();
}

function normalizeLink(link: string) {
  if (!link) {
    return "https://www.fmprc.gov.cn/eng/xwfw_665399/s2510_665401/";
  }

  if (link.startsWith("http")) return link;
  if (link.startsWith("/")) return `https://www.fmprc.gov.cn${link}`;
  return `https://www.fmprc.gov.cn/eng/xwfw_665399/s2510_665401/${link}`;
}

function buildSignal(
  title: string,
  link: string,
  timestamp: string
): ExternalSignal {
  return {
    source: "China Government",
    sourceType: "Government",
    title,
    description: "Chinese foreign ministry update.",
    timestamp: new Date(timestamp).toISOString(),
    category: "Geopolitics",
    region: "East Asia",
    country: "China",
    locationLabel: "China",
    actors: ["Government of China"],
    keywords: ["china", "government", "foreign ministry", "diplomacy"],
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
    throw new Error(`China government page failed: ${res.status}`);
  }

  return res.text();
}

export const chinaGovSource: SignalSource = {
  key: "china-government",
  displayName: "China Government",

  async fetchSignals(): Promise<SignalSourceResult> {
    const html = await fetchPage(
      "https://www.fmprc.gov.cn/eng/xwfw_665399/s2510_665401/"
    );

    const blocks = extractArticleBlocks(html);

    const signals: ExternalSignal[] = blocks.slice(0, 10).map((block) => {
      const title = extractTitle(block);
      const link = extractHref(block);
      const published = extractDate(block);

      return buildSignal(title, link, published);
    });

    return {
      sourceKey: "china-government",
      fetchedCount: signals.length,
      signals,
    };
  },
};