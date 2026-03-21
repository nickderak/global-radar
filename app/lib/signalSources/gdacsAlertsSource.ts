import type {
  ExternalSignal,
  SignalSource,
  SignalSourceResult,
} from "./types";

const GDACS_RSS_URL = "https://www.gdacs.org/xml/rss.xml";

type RssItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, " ");
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}…`;
}

function extractTag(block: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, "i");
  const match = block.match(regex);
  return match ? normalizeWhitespace(decodeXml(match[1])) : "";
}

function parseRssItems(xml: string): RssItem[] {
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi) ?? [];

  return itemMatches
    .map((itemBlock) => {
      const title = extractTag(itemBlock, "title");
      const link = extractTag(itemBlock, "link");
      const description = extractTag(itemBlock, "description");
      const pubDate = extractTag(itemBlock, "pubDate");

      return {
        title,
        link,
        description,
        pubDate,
      };
    })
    .filter((item) => item.title && item.link);
}

function inferCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("earthquake") || text.includes("seismic")) return "Disaster";
  if (text.includes("flood")) return "Disaster";
  if (text.includes("cyclone") || text.includes("hurricane") || text.includes("storm")) {
    return "Weather";
  }
  if (text.includes("wildfire") || text.includes("fire")) return "Disaster";
  if (text.includes("volcano") || text.includes("eruption")) return "Disaster";
  if (text.includes("drought")) return "Disaster";
  if (text.includes("landslide")) return "Disaster";

  return "Disaster";
}

function inferConfidence(title: string): string {
  const text = title.toLowerCase();

  if (text.includes("red")) return "High";
  if (text.includes("orange")) return "Medium";
  return "Low";
}

function inferCountry(title: string, description: string): string {
  const text = `${title} ${description}`;

  const patterns = [
    "United States",
    "Mexico",
    "Canada",
    "Chile",
    "Peru",
    "Argentina",
    "Brazil",
    "Colombia",
    "Ecuador",
    "Japan",
    "Taiwan",
    "China",
    "Indonesia",
    "Philippines",
    "New Zealand",
    "Australia",
    "India",
    "Pakistan",
    "Bangladesh",
    "Turkey",
    "Greece",
    "Italy",
    "Russia",
    "Ukraine",
    "Israel",
    "Yemen",
    "Kenya",
    "Ethiopia",
    "Somalia",
    "South Africa",
    "Mozambique",
    "Madagascar",
    "Vanuatu",
    "Tonga",
    "Fiji",
    "Solomon Islands",
  ];

  for (const country of patterns) {
    if (text.toLowerCase().includes(country.toLowerCase())) {
      return country;
    }
  }

  return "Unknown";
}

function inferRegion(country: string): string {
  const normalized = country.toLowerCase();

  if (["united states", "canada", "mexico"].includes(normalized)) {
    return "North America";
  }

  if (
    ["chile", "peru", "argentina", "brazil", "colombia", "ecuador"].includes(
      normalized
    )
  ) {
    return "South America";
  }

  if (
    [
      "japan",
      "taiwan",
      "china",
      "indonesia",
      "philippines",
      "new zealand",
      "australia",
      "vanuatu",
      "tonga",
      "fiji",
      "solomon islands",
      "india",
      "pakistan",
      "bangladesh",
    ].includes(normalized)
  ) {
    return "Asia-Pacific";
  }

  if (
    ["turkey", "greece", "italy", "russia", "ukraine"].includes(normalized)
  ) {
    return "Europe";
  }

  if (
    ["kenya", "ethiopia", "somalia", "south africa", "mozambique", "madagascar"].includes(
      normalized
    )
  ) {
    return "Africa";
  }

  if (["israel", "yemen"].includes(normalized)) {
    return "Middle East";
  }

  return "Global";
}

function inferLocationLabel(title: string, description: string, country: string): string {
  const text = normalizeWhitespace(`${title} ${description}`);

  if (country !== "Unknown") return country;

  const match = text.match(/\bin\s+([A-Z][A-Za-z\s.-]{2,40})/);
  if (match) return match[1].trim();

  return "Global";
}

function buildKeywords(title: string, description: string): string[] {
  const tokens = `${title} ${description} gdacs disaster`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  return Array.from(new Set(tokens)).slice(0, 16);
}

function itemToSignal(item: RssItem): ExternalSignal {
  const descriptionText = truncate(
    normalizeWhitespace(stripTags(item.description)),
    400
  );

  const country = inferCountry(item.title, descriptionText);
  const region = inferRegion(country);
  const locationLabel = inferLocationLabel(item.title, descriptionText, country);

  return {
    source: "GDACS",
    sourceType: "Government / International",
    title: truncate(item.title, 180),
    description:
      descriptionText || "GDACS disaster alert issued for an active event.",
    timestamp: item.pubDate
      ? new Date(item.pubDate).toISOString()
      : new Date().toISOString(),
    category: inferCategory(item.title, descriptionText),
    region,
    country,
    locationLabel,
    actors: ["GDACS"],
    keywords: buildKeywords(item.title, descriptionText),
    rawUrl: item.link,
    confidenceSeed: inferConfidence(item.title),
  };
}

export const gdacsAlertsSource: SignalSource = {
  key: "gdacs-alerts",
  displayName: "GDACS Disaster Alerts",

  async fetchSignals(): Promise<SignalSourceResult> {
    const response = await fetch(GDACS_RSS_URL, {
      cache: "no-store",
      headers: {
        "User-Agent": "GlobalRadar/1.0",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!response.ok) {
      throw new Error(`GDACS feed request failed with status ${response.status}`);
    }

    const xml = await response.text();
    const items = parseRssItems(xml);
    const signals = items.slice(0, 40).map(itemToSignal);

    return {
      sourceKey: "gdacs-alerts",
      fetchedCount: signals.length,
      signals,
    };
  },
};