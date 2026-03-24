import type {
  ExternalSignal,
  SignalSource,
  SignalSourceResult,
} from "./types";

const INDIA_PIB_RSS_URL =
  "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3";

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

function isUsefulIndiaItem(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("cabinet")) return false;
  if (text.includes("sports")) return false;
  if (text.includes("railway")) return false;
  if (text.includes("culture")) return false;
  if (text.includes("agriculture")) return false;

  return true;
}

function inferCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  if (
    text.includes("defence") ||
    text.includes("defense") ||
    text.includes("security") ||
    text.includes("military") ||
    text.includes("navy") ||
    text.includes("army") ||
    text.includes("air force")
  ) {
    return "Military";
  }

  return "Geopolitics";
}

function buildSignal(
  title: string,
  description: string,
  link: string,
  pubDate: string
): ExternalSignal {
  return {
    source: "India PIB",
    sourceType: "Government",
    title,
    description: description || "Government of India press release.",
    timestamp: new Date(pubDate).toISOString(),
    category: inferCategory(title, description),
    region: "South Asia",
    country: "India",
    locationLabel: "India",
    actors: ["Government of India"],
    keywords: ["india", "government", "policy", "diplomacy", "security"],
    rawUrl: link || INDIA_PIB_RSS_URL,
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
    throw new Error(`India PIB RSS failed: ${response.status}`);
  }

  return response.text();
}

export const indiaGovSource: SignalSource = {
  key: "india-government",
  displayName: "India Government",

  async fetchSignals(): Promise<SignalSourceResult> {
    try {
      const xml = await fetchRss(INDIA_PIB_RSS_URL);
      const items = parseItems(xml);

      const signals: ExternalSignal[] = items
        .slice(0, 25)
        .map((item) => {
          const title = extractTag(item, "title") || "India update";
          const description = extractTag(item, "description");
          const link = extractTag(item, "link");
          const pubDate =
            extractTag(item, "pubDate") || new Date().toISOString();

          return { title, description, link, pubDate };
        })
        .filter((item) => isUsefulIndiaItem(item.title, item.description))
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
        sourceKey: "india-government",
        fetchedCount: signals.length,
        signals,
      };
    } catch (error) {
      console.error("India feed error:", error);

      return {
        sourceKey: "india-government",
        fetchedCount: 0,
        signals: [],
      };
    }
  },
};