import type {
  ExternalSignal,
  SignalSource,
  SignalSourceResult,
} from "./types";

const UN_SC_RSS_URL = "https://news.un.org/feed/subscribe/en/news/topic/security-council/feed/rss.xml";

function cleanText(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block: string, tag: string) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = block.match(regex);
  return match ? cleanText(match[1]) : "";
}

function parseItems(xml: string) {
  const matches = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  return matches;
}

function buildSignal(
  title: string,
  description: string,
  link: string,
  pubDate: string
): ExternalSignal {
  return {
    source: "UN Security Council",
    sourceType: "Government",
    title,
    description: description || "UN Security Council update.",
    timestamp: new Date(pubDate).toISOString(),
    category: "Geopolitics",
    region: "Global",
    country: "International",
    locationLabel: "United Nations",
    actors: ["United Nations"],
    keywords: ["un", "security council", "diplomacy", "conflict"],
    rawUrl: link || UN_SC_RSS_URL,
    confidenceSeed: "High",
  };
}

async function fetchRss(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
  });

  if (!response.ok) {
    throw new Error(`UN Security Council RSS failed: ${response.status}`);
  }

  return response.text();
}

export const unSecurityCouncilSource: SignalSource = {
  key: "un-security-council",
  displayName: "UN Security Council",

  async fetchSignals(): Promise<SignalSourceResult> {
    try {
      const xml = await fetchRss(UN_SC_RSS_URL);
      const items = parseItems(xml);

      const signals: ExternalSignal[] = items.slice(0, 10).map((item) => {
        const title = extractTag(item, "title") || "UN update";
        const description = extractTag(item, "description");
        const link = extractTag(item, "link");
        const pubDate =
          extractTag(item, "pubDate") || new Date().toISOString();

        return buildSignal(title, description, link, pubDate);
      });

      return {
        sourceKey: "un-security-council",
        fetchedCount: signals.length,
        signals,
      };
    } catch (error) {
      console.error("UN Security Council feed error:", error);

      return {
        sourceKey: "un-security-council",
        fetchedCount: 0,
        signals: [],
      };
    }
  },
};