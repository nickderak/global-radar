import type {
  ExternalSignal,
  SignalSource,
  SignalSourceResult,
} from "./types";

const UN_RSS_URL =
  "https://news.un.org/feed/subscribe/en/news/topic/peace-and-security/feed/rss.xml";

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
  return xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
}

function decodeCommonArtifacts(value: string) {
  return value
    .replace(/â€˜/g, "‘")
    .replace(/â€™/g, "’")
    .replace(/â€œ/g, "“")
    .replace(/â€/g, "”")
    .replace(/â€”/g, "—")
    .replace(/â€“/g, "–");
}

function isUsefulUnItem(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("world news in brief")) return false;

  return true;
}

function buildSignal(
  title: string,
  description: string,
  link: string,
  pubDate: string
): ExternalSignal {
  return {
    source: "UN Security Council",
    sourceType: "International Organization",
    title: decodeCommonArtifacts(title),
    description: decodeCommonArtifacts(
      description || "UN peace and security update."
    ),
    timestamp: new Date(pubDate).toISOString(),
    category: "Geopolitics",
    region: "Global",
    country: "International",
    locationLabel: "United Nations",
    actors: ["United Nations"],
    keywords: ["un", "security council", "diplomacy", "conflict"],
    rawUrl: link || UN_RSS_URL,
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
    throw new Error(`UN RSS failed: ${response.status}`);
  }

  return response.text();
}

export const unSecurityCouncilSource: SignalSource = {
  key: "un-security-council",
  displayName: "UN Security Council",

  async fetchSignals(): Promise<SignalSourceResult> {
    try {
      const xml = await fetchRss(UN_RSS_URL);
      const items = parseItems(xml);

      const signals: ExternalSignal[] = items
        .slice(0, 20)
        .map((item) => {
          const title = extractTag(item, "title") || "UN update";
          const description = extractTag(item, "description");
          const link = extractTag(item, "link");
          const pubDate =
            extractTag(item, "pubDate") || new Date().toISOString();

          return { title, description, link, pubDate };
        })
        .filter((item) => isUsefulUnItem(item.title, item.description))
        .slice(0, 10)
        .map((item) =>
          buildSignal(
            item.title,
            item.description,
            item.link,
            item.pubDate
          )
        );

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