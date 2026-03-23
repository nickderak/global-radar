import type {
  ExternalSignal,
  SignalSource,
  SignalSourceResult,
} from "./types";

const PAKISTAN_MOFA_URL = "https://mofa.gov.pk/press-releases/";

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
  if (!link) return PAKISTAN_MOFA_URL;
  if (link.startsWith("http")) return link;
  if (link.startsWith("/")) return `https://mofa.gov.pk${link}`;
  return new URL(link, PAKISTAN_MOFA_URL).toString();
}

function extractLinks(html: string) {
  const matches = [...html.matchAll(/href="([^"]*press-releases[^"]*)"/gi)];
  return Array.from(
    new Set(
      matches
        .map((match) => match[1])
        .filter((value): value is string => Boolean(value))
    )
  );
}

function titleFromUrl(link: string) {
  const raw = link.split("/").filter(Boolean).pop() ?? "pakistan-update";

  return raw
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function buildSignal(link: string): ExternalSignal {
  return {
    source: "Pakistan Government",
    sourceType: "Government",
    title: titleFromUrl(link),
    description: "Pakistan government foreign affairs update.",
    timestamp: new Date().toISOString(),
    category: "Geopolitics",
    region: "South Asia",
    country: "Pakistan",
    locationLabel: "Pakistan",
    actors: ["Government of Pakistan"],
    keywords: ["pakistan", "government", "foreign policy", "diplomacy"],
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
    throw new Error(`Pakistan government page failed: ${res.status}`);
  }

  return res.text();
}

export const pakistanGovSource: SignalSource = {
  key: "pakistan-government",
  displayName: "Pakistan Government",

  async fetchSignals(): Promise<SignalSourceResult> {
    try {
      const html = await fetchPage(PAKISTAN_MOFA_URL);
      const links = extractLinks(html);

      const signals = links.slice(0, 10).map((link) => buildSignal(link));

      return {
        sourceKey: "pakistan-government",
        fetchedCount: signals.length,
        signals,
      };
    } catch (error) {
      console.error("Pakistan feed error:", error);

      return {
        sourceKey: "pakistan-government",
        fetchedCount: 0,
        signals: [],
      };
    }
  },
};