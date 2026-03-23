import type {
  ExternalSignal,
  SignalSource,
  SignalSourceResult,
} from "./types";

const INDIA_MEA_URL = "https://www.mea.gov.in/press-releases.htm";
const INDIA_PIB_URL = "https://pib.gov.in/allRel.aspx";

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

function normalizeLink(baseUrl: string, link: string) {
  if (!link) return baseUrl;
  if (link.startsWith("http")) return link;
  if (link.startsWith("/")) {
    const url = new URL(baseUrl);
    return `${url.origin}${link}`;
  }
  return new URL(link, baseUrl).toString();
}

function extractLinks(html: string, pattern: RegExp) {
  const matches = [...html.matchAll(pattern)];
  return Array.from(
    new Set(
      matches
        .map((match) => match[1])
        .filter((value): value is string => Boolean(value))
    )
  );
}

function titleFromUrl(link: string) {
  const raw = link.split("/").pop() ?? "india-update";

  return raw
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function buildSignal(
  source: string,
  baseUrl: string,
  link: string
): ExternalSignal {
  return {
    source,
    sourceType: "Government",
    title: titleFromUrl(link),
    description: `${source} update.`,
    timestamp: new Date().toISOString(),
    category: "Geopolitics",
    region: "South Asia",
    country: "India",
    locationLabel: "India",
    actors: ["Government of India"],
    keywords: ["india", "government", "policy", "diplomacy"],
    rawUrl: normalizeLink(baseUrl, link),
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
    throw new Error(`India page failed: ${res.status}`);
  }

  return res.text();
}

export const indiaGovSource: SignalSource = {
  key: "india-government",
  displayName: "India Government (MEA + PIB)",

  async fetchSignals(): Promise<SignalSourceResult> {
    try {
      const [meaHtml, pibHtml] = await Promise.all([
        fetchPage(INDIA_MEA_URL),
        fetchPage(INDIA_PIB_URL),
      ]);

      const meaLinks = extractLinks(
        meaHtml,
        /href="([^"]*press-releases-details[^"]*)"/gi
      );
      const pibLinks = extractLinks(
        pibHtml,
        /href="([^"]*PressReleasePage\.aspx\?PRID=[^"]*)"/gi
      );

      const signals = [
        ...meaLinks.slice(0, 5).map((link) =>
          buildSignal("India MEA", INDIA_MEA_URL, link)
        ),
        ...pibLinks.slice(0, 5).map((link) =>
          buildSignal("India PIB", INDIA_PIB_URL, link)
        ),
      ];

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