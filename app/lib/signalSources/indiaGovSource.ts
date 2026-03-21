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
  source: string,
  title: string,
  description: string,
  link: string,
  timestamp: string
): ExternalSignal {
  return {
    source,
    sourceType: "Government",
    title,
    description,
    timestamp: new Date(timestamp).toISOString(),
    category: "Geopolitics",
    region: "South Asia",
    country: "India",
    locationLabel: "India",
    actors: ["Government of India"],
    keywords: ["india", "government", "policy", "diplomacy"],
    rawUrl: link,
    confidenceSeed: "High",
  };
}

async function fetchRss(url: string) {
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "GlobalRadar/1.0",
    },
  });

  if (!res.ok) {
    throw new Error(`India RSS failed: ${res.status}`);
  }

  return res.text();
}

export const indiaGovSource: SignalSource = {
  key: "india-government",
  displayName: "India Government (MEA + PIB)",

  async fetchSignals(): Promise<SignalSourceResult> {
    const urls = [
      "https://www.mea.gov.in/rss-feed.htm",
      "https://pib.gov.in/rssfeed.aspx",
    ];

    const allSignals: ExternalSignal[] = [];

    for (const url of urls) {
      try {
        const xml = await fetchRss(url);
        const items = parseItems(xml);

        for (const item of items.slice(0, 10)) {
          const title = extractTag(item, "title")[0] ?? "India update";
          const description = extractTag(item, "description")[0] ?? "";
          const link = extractTag(item, "link")[0] ?? "";
          const pubDate =
            extractTag(item, "pubDate")[0] ?? new Date().toISOString();

          allSignals.push(
            buildSignal("India Government", title, description, link, pubDate)
          );
        }
      } catch (error) {
        console.error("India feed error:", error);
      }
    }

    return {
      sourceKey: "india-government",
      fetchedCount: allSignals.length,
      signals: allSignals,
    };
  },
};