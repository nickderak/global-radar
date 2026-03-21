import type {
  ExternalSignal,
  SignalSource,
  SignalSourceResult,
} from "./types";

function cleanText(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

function extractTag(content: string, tag: string) {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g");
  const matches = [...content.matchAll(regex)];
  return matches.map((m) => cleanText(m[1]));
}

function parseItems(xml: string) {
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  return [...xml.matchAll(itemRegex)].map((m) => m[1]);
}

function buildSignal(
  title: string,
  description: string,
  link: string,
  timestamp: string
) {
  return {
    source: "UN Security Council",
    sourceType: "International Organization",
    title,
    description,
    timestamp,
    category: "Geopolitics",
    region: "Global",
    country: "Global",
    locationLabel: "United Nations",
    actors: ["UN Security Council"],
    keywords: ["un", "security council", "geopolitics", "conflict", "diplomacy"],
    rawUrl: link,
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
    throw new Error(`UN Security Council feed failed: ${res.status}`);
  }

  return res.text();
}

export const unSecurityCouncilSource: SignalSource = {
  key: "un-security-council",
  displayName: "UN Security Council",

  async fetchSignals(): Promise<SignalSourceResult> {
    const xml = await fetchPage("https://news.un.org/feed/subscribe/en/news/topic/peace-and-security/feed/rss.xml");
    const items = parseItems(xml);

    const signals = items.slice(0, 10).map((item) => {
      const title = extractTag(item, "title")[0] ?? "UN Security Council update";
      const description = extractTag(item, "description")[0] ?? "";
      const link = extractTag(item, "link")[0] ?? "";
      const pubDate =
        extractTag(item, "pubDate")[0] ?? new Date().toISOString();

      return buildSignal(title, description, link, pubDate);
    });

    return {
      sourceKey: "un-security-council",
      fetchedCount: signals.length,
      signals,
    };
  },
};