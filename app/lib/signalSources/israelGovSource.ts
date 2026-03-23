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

function extractArticleBlocks(html: string) {
  const matches = html.match(
    /<a[^>]+href="\/en\/pages\/[^"]+"[\s\S]*?<\/a>/gi
  );
  return matches ?? [];
}

function extractHref(block: string) {
  const match = block.match(/href="([^"]+)"/i);
  return match ? match[1] : "";
}

function extractTitle(block: string) {
  const text = cleanText(block);
  return text || "Israel government update";
}

function extractDate(block: string) {
  const match = block.match(/\b\d{1,2}\.\d{1,2}\.\d{4}\b/);
  if (!match) return new Date().toISOString();

  const [day, month, year] = match[0].split(".");
  return new Date(
    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00.000Z`
  ).toISOString();
}

function buildSignal(
  title: string,
  link: string,
  timestamp: string
): ExternalSignal {
  return {
    source: "Israel Government",
    sourceType: "Government",
    title,
    description: "Israel government foreign affairs / national security update.",
    timestamp,
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
      const blocks = extractArticleBlocks(html);

      const signals: ExternalSignal[] = blocks.slice(0, 10).map((block) => {
        const title = extractTitle(block);
        const link = extractHref(block);
        const published = extractDate(block);

        return buildSignal(title, link, published);
      });

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