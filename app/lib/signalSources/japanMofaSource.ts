import type {
  ExternalSignal,
  SignalSource,
  SignalSourceResult,
} from "./types";

function cleanText(value: string) {
  return value.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim();
}

function extractTag(content: string, tag: string) {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, "g");
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
): ExternalSignal {
  return {
    source: "Japan MOFA",
    sourceType: "Government",
    title,
    description,
    timestamp,
    category: "Geopolitics",
    region: "East Asia",
    country: "Japan",
    locationLabel: "Japan",
    actors: ["Government of Japan"],
    keywords: ["japan", "mofa", "foreign policy", "diplomacy"],
    rawUrl: link,
    confidenceSeed: "High",
  };
}

async function fetchRss(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Japan MOFA RSS failed: ${res.status}`);
  }
  return res.text();
}

export const japanMofaSource: SignalSource = {
  key: "japan-mofa",
  displayName: "Japan MOFA",

  async fetchSignals(): Promise<SignalSourceResult> {
    const xml = await fetchRss("https://www.mofa.go.jp/press/release/rss.xml");
    const items = parseItems(xml);

    const signals: ExternalSignal[] = items.slice(0, 10).map((item) => {
      const title = extractTag(item, "title")[0] ?? "Japan update";
      const description = extractTag(item, "description")[0] ?? "";
      const link = extractTag(item, "link")[0] ?? "";
      const pubDate =
        extractTag(item, "pubDate")[0] ?? new Date().toISOString();

      return buildSignal(title, description, link, pubDate);
    });

    return {
      sourceKey: "japan-mofa",
      fetchedCount: signals.length,
      signals,
    };
  },
};