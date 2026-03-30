import type {
  ExternalSignal,
  SignalSource,
  SignalSourceResult,
} from "./types";

const AP_WORLD_URL = "https://apnews.com/world-news";

function extractLinks(html: string) {
  const matches = [
    ...html.matchAll(/href="(\/article\/[^"#?]+)"/gi),
    ...html.matchAll(/href="(https:\/\/apnews\.com\/article\/[^"#?]+)"/gi),
  ];

  return Array.from(
    new Set(
      matches
        .map((match) => match[1])
        .filter((value): value is string => Boolean(value))
    )
  );
}

function normalizeLink(link: string) {
  if (link.startsWith("http")) return link;
  return `https://apnews.com${link}`;
}

function titleFromUrl(link: string) {
  const raw = link.split("/").filter(Boolean).pop() ?? "ap-update";

  return raw
    .replace(/-[a-f0-9]{24,}$/i, "")
    .replace(/-\d{4}-\d{2}-\d{2}/g, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function isUsefulApTitle(title: string) {
  const t = title.toLowerCase();

  if (!t || t.length < 12) return false;

  return (
    t.includes("war") ||
    t.includes("iran") ||
    t.includes("israel") ||
    t.includes("ukraine") ||
    t.includes("russia") ||
    t.includes("middle east") ||
    t.includes("oil") ||
    t.includes("tanker") ||
    t.includes("houthi") ||
    t.includes("yemen") ||
    t.includes("security") ||
    t.includes("sanction") ||
    t.includes("strike") ||
    t.includes("attack") ||
    t.includes("drones") ||
    t.includes("economy") ||
    t.includes("arab league")
  );
}

function buildSignal(title: string, link: string): ExternalSignal {
  return {
    source: "Associated Press",
    sourceType: "Media",
    title,
    description: "AP world news signal.",
    timestamp: new Date().toISOString(),
    category: "Geopolitics",
    region: "Global",
    country: "International",
    locationLabel: "Global",
    actors: ["Associated Press"],
    keywords: ["ap", "associated press", "world", "geopolitics", "breaking"],
    rawUrl: normalizeLink(link),
    confidenceSeed: "Medium",
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
    throw new Error(`AP page failed: ${res.status}`);
  }

  return res.text();
}

export const apSource: SignalSource = {
  key: "associated-press",
  displayName: "Associated Press",

  async fetchSignals(): Promise<SignalSourceResult> {
    try {
      const html = await fetchPage(AP_WORLD_URL);
      const links = extractLinks(html);

      const signals: ExternalSignal[] = links
        .slice(0, 30)
        .map((link) => {
          const title = titleFromUrl(link);
          return { title, link };
        })
        .filter((item) => isUsefulApTitle(item.title))
        .slice(0, 10)
        .map((item) => buildSignal(item.title, item.link));

      return {
        sourceKey: "associated-press",
        fetchedCount: signals.length,
        signals,
      };
    } catch (error) {
      console.error("AP feed error:", error);

      return {
        sourceKey: "associated-press",
        fetchedCount: 0,
        signals: [],
      };
    }
  },
};