import type {
  ExternalSignal,
  SignalSource,
  SignalSourceResult,
} from "./types";

const ISRAEL_MFA_NEWS_URL =
  "https://www.gov.il/en/collectors/news?officeId=6cbf57de-3976-484a-8666-995ca17899ec";

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
  if (!link) return ISRAEL_MFA_NEWS_URL;
  if (link.startsWith("http")) return link;
  if (link.startsWith("/")) return `https://www.gov.il${link}`;
  return `https://www.gov.il/${link}`;
}

function extractArticleLinks(html: string) {
  const matches = html.match(/href="\/en\/pages\/[^"]+"/gi) ?? [];
  return Array.from(
    new Set(
      matches.map((match) => match.replace(/^href="/i, "").replace(/"$/, ""))
    )
  );
}

function titleFromSlug(link: string) {
  const slug = link.split("/").pop() ?? "israel-update";

  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function buildSignal(link: string): ExternalSignal {
  const title = titleFromSlug(link);

  return {
    source: "Israel Government",
    sourceType: "Government",
    title,
    description: "Israel government foreign affairs / national security update.",
    timestamp: new Date().toISOString(),
    category: "Geopolitics",
    region: "Middle East",
    country: "Israel",
    locationLabel: "Israel",
    actors: ["Government of Israel"],
    keywords: ["israel", "government", "foreign affairs", "security", "diplomacy"],
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
    throw new Error(`Israel government page failed: ${res.status}`);
  }

  return res.text();
}

export const israelGovSource: SignalSource = {
  key: "israel-government",
  displayName: "Israel Government",

  async fetchSignals(): Promise<SignalSourceResult> {
    try {
      const html = await fetchPage(ISRAEL_MFA_NEWS_URL);
      const links = extractArticleLinks(html);

      const signals = links.slice(0, 10).map((link) => buildSignal(link));

      return {
        sourceKey: "israel-government",
        fetchedCount: signals.length,
        signals,
      };
    } catch (error) {
      console.error("Israel feed error:", error);

      return {
        sourceKey: "israel-government",
        fetchedCount: 0,
        signals: [],
      };
    }
  },
};