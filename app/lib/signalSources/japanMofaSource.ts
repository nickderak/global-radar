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

async function fetchRss(url: string) {
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/rss+xml, application/xml",
    },
  });

  if (!res.ok) {
    throw new Error(`Japan MOFA RSS failed: ${res.status}`);
  }

  return res.text();
}

export const japanMofaSource: SignalSource = {
  key: "japan-mofa",
  displayName: "Japan MOFA",

  async fetchSignals(): Promise<SignalSourceResult> {
    try {
      const xml = await fetchRss(
        "https://www.mofa.go.jp/press/release/rss.xml"
      );

      const items = parseItems(xml);

      const signals: ExternalSignal[] = items.slice(0, 10).map((item) => {
        const title = extractTag(item, "title")[0] ?? "Japan update";
        const description = extractTag(item, "description")[0] ?? "";
        const link = extractTag(item, "link")[0] ?? "";
        const pubDate =
          extractTag(item, "pubDate")[0] ?? new Date().toISOString();

        return {
          source: "Japan MOFA",
          sourceType: "Government",
          title,
          description,
          timestamp: new Date(pubDate).toISOString(),
          category: "Geopolitics",
          region: "East Asia",
          country: "Japan",
          locationLabel: "Japan",
          actors: ["Government of Japan"],
          keywords: ["japan", "mofa", "foreign policy"],
          rawUrl: link,
          confidenceSeed: "High",
        };
      });

      return {
        sourceKey: this.key,
        fetchedCount: signals.length,
        signals,
      };
    } catch (error) {
      console.error("Japan feed error:", error);

      return {
        sourceKey: this.key,
        fetchedCount: 0,
        signals: [],
      };
    }
  },
};