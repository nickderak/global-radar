console.log("✅ EU EEAS SOURCE FILE LOADED");

import type {
  ExternalSignal,
  SignalSource,
  SignalSourceResult,
} from "./types";

const EU_NEWS_RSS =
  "https://ec.europa.eu/commission/presscorner/api/rss";

function cleanText(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
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

//
// ✅ NEW HELPER (FILTER LOW-VALUE EU CONTENT)
//
function isUsefulEuItem(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase();

  // Remove admin / low-value items
  if (text.includes("commission decision")) return false;
  if (text.includes("daily news")) return false;
  if (text.includes("speech")) return false;
  if (text.includes("statement")) return false;
  if (text.includes("press contact")) return false;

  return true;
}

function buildSignal(
  title: string,
  description: string,
  link: string,
  pubDate: string
): ExternalSignal {
  return {
    source: "European Commission",
    sourceType: "Government",
    title,
    description: description || "EU Commission update.",
    timestamp: new Date(pubDate).toISOString(),
    category: "Geopolitics",
    region: "Europe",
    country: "European Union",
    locationLabel: "European Union",
    actors: ["European Union"],
    keywords: ["eu", "europe", "policy", "commission"],
    rawUrl: link || EU_NEWS_RSS,
    confidenceSeed: "High",
  };
}

async function fetchRss(url: string) {
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
  });

  if (!res.ok) {
    throw new Error(`EU RSS failed: ${res.status}`);
  }

  return res.text();
}

export const euEeasSource: SignalSource = {
  key: "eu-eeas",
  displayName: "EU Commission",

  async fetchSignals(): Promise<SignalSourceResult> {
    console.log("🚀 EU EEAS FETCH RUNNING");

    try {
      const xml = await fetchRss(EU_NEWS_RSS);
      const items = parseItems(xml);

      const signals: ExternalSignal[] = items
        .slice(0, 25)
        .map((item) => {
          const title = extractTag(item, "title") || "EU update";
          const description = extractTag(item, "description");
          const link = extractTag(item, "link");
          const pubDate =
            extractTag(item, "pubDate") || new Date().toISOString();

          return { title, description, link, pubDate };
        })
        .filter((item) =>
          isUsefulEuItem(item.title, item.description)
        ) // ✅ FILTER APPLIED
        .slice(0, 10)
        .map((item) =>
          buildSignal(item.title, item.description, item.link, item.pubDate)
        );

      return {
        sourceKey: "eu-eeas",
        fetchedCount: signals.length,
        signals,
      };
    } catch (error) {
      console.error("EU feed error:", error);

      return {
        sourceKey: "eu-eeas",
        fetchedCount: 0,
        signals: [],
      };
    }
  },
};