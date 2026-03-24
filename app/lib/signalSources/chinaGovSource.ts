import type {
  ExternalSignal,
  SignalSource,
  SignalSourceResult,
} from "./types";

const CHINA_MFA_URL =
  "https://www.fmprc.gov.cn/eng/xwfw_665399/s2510_665401/";

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

function extractArticleBlocks(html: string) {
  const matches = html.match(
    /<li[\s\S]*?<\/li>|<div[\s\S]*?class="[^"]*news[^"]*"[\s\S]*?<\/div>/gi
  );

  return matches ?? [];
}

function extractHref(block: string) {
  const match = block.match(/href="([^"]+)"/i);
  return match ? match[1] : "";
}

function extractTitle(block: string) {
  const linkMatch = block.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
  if (linkMatch) return cleanText(linkMatch[1]);

  return "";
}

function extractDate(block: string) {
  const dateMatch = block.match(
    /\b(\d{4}-\d{2}-\d{2}|\d{4}\/\d{2}\/\d{2})\b/
  );

  return dateMatch ? cleanText(dateMatch[1]) : new Date().toISOString();
}

function normalizeLink(link: string) {
  if (!link) {
    return CHINA_MFA_URL;
  }

  if (link.startsWith("http")) return link;
  if (link.startsWith("/")) return `https://www.fmprc.gov.cn${link}`;
  return `https://www.fmprc.gov.cn/eng/xwfw_665399/s2510_665401/${link}`;
}

function isGarbledTitle(title: string) {
  return /å|ä|æ|ç|é|è|ö|ü|ß/.test(title);
}

function isUsefulChinaTitle(title: string) {
  const normalized = title.trim();

  if (!normalized) return false;
  if (normalized.length < 12) return false;
  if (isGarbledTitle(normalized)) return false;

  const lower = normalized.toLowerCase();

  if (lower === "foreign ministry") return false;
  if (lower === "ministry of foreign affairs") return false;
  if (lower.includes("embassies and consulates")) return false;
  if (lower.includes("spokesperson")) return false;
  if (lower.includes("service")) return false;
  if (lower.includes("archives")) return false;

  return true;
}

function buildSignal(
  title: string,
  link: string,
  timestamp: string
): ExternalSignal {
  return {
    source: "China Government",
    sourceType: "Government",
    title,
    description: "Chinese foreign ministry update.",
    timestamp: new Date(timestamp).toISOString(),
    category: "Geopolitics",
    region: "East Asia",
    country: "China",
    locationLabel: "China",
    actors: ["Government of China"],
    keywords: ["china", "government", "foreign ministry", "diplomacy"],
    rawUrl: normalizeLink(link),
    confidenceSeed: "High",
  };
}

async function fetchPage(url: string) {
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "GlobalRadar/1.0",
    },
  });

  if (!res.ok) {
    throw new Error(`China government page failed: ${res.status}`);
  }

  return res.text();
}

export const chinaGovSource: SignalSource = {
  key: "china-government",
  displayName: "China Government",

  async fetchSignals(): Promise<SignalSourceResult> {
    try {
      const html = await fetchPage(CHINA_MFA_URL);
      const blocks = extractArticleBlocks(html);

      const signals: ExternalSignal[] = blocks
        .slice(0, 30)
        .map((block) => {
          const title = extractTitle(block);
          const link = extractHref(block);
          const published = extractDate(block);

          return { title, link, published };
        })
        .filter((item) => isUsefulChinaTitle(item.title))
        .slice(0, 10)
        .map((item) => buildSignal(item.title, item.link, item.published));

      return {
        sourceKey: "china-government",
        fetchedCount: signals.length,
        signals,
      };
    } catch (error) {
      console.error("China government feed error:", error);

      return {
        sourceKey: "china-government",
        fetchedCount: 0,
        signals: [],
      };
    }
  },
};