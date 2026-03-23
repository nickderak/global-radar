import type {
  ExternalSignal,
  SignalSource,
  SignalSourceResult,
} from "./types";

const JAPAN_MOFA_NEWS_URL =
  "https://www.mofa.go.jp/press/release/index.html";

function cleanText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLink(link: string) {
  if (!link) return JAPAN_MOFA_NEWS_URL;
  if (link.startsWith("http")) return link;
  if (link.startsWith("/")) return `https://www.mofa.go.jp${link}`;
  return new URL(link, JAPAN_MOFA_NEWS_URL).toString();
}

function extractLinks(html: string) {
  const matches = [...html.matchAll(/href="([^"]*\/press\/release\/[^"]*)"/gi)];
  return Array.from(
    new Set(
      matches
        .map((match) => match[1])
        .filter((value): value is string => Boolean(value))
    )
  );
}

function titleFromUrl(link: string) {
  const raw = link.split("/").pop() ?? "japan-update";

  return raw
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function buildSignal(link: string): ExternalSignal {
  return {
    source: "Japan MOFA",
    sourceType: "Government",
    title: titleFromUrl(link),
    description: "Japan Ministry of Foreign Affairs update.",
    timestamp: new Date().toISOString(),
    category: "Geopolitics",
    region: "East Asia",
    country: "Japan",
    locationLabel: "Japan",
    actors: ["Government of Japan"],
    keywords: ["japan", "mofa", "foreign policy", "diplomacy"],
    rawUrl: normalizeLink(link),
    confidenceSeed: "High",
  };
}

async function fetchPage(url: string) {
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!res.ok) {
    throw new Error(`Japan MOFA page failed: ${res.status}`);
  }

  return res.text();
}

export const japanMofaSource: SignalSource = {
  key: "japan-mofa",
  displayName: "Japan MOFA",

  async fetchSignals(): Promise<SignalSourceResult> {
    try {
      const html = await fetchPage(JAPAN_MOFA_NEWS_URL);
      const links = extractLinks(html);

      const signals = links.slice(0, 10).map((link) => buildSignal(link));

      return {
        sourceKey: "japan-mofa",
        fetchedCount: signals.length,
        signals,
      };
    } catch (error) {
      console.error("Japan feed error:", error);

      return {
        sourceKey: "japan-mofa",
        fetchedCount: 0,
        signals: [],
      };
    }
  },
};