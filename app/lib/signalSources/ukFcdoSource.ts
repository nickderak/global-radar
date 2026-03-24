import type {
  ExternalSignal,
  SignalSource,
  SignalSourceResult,
} from "./types";

const UK_FCDO_ATOM_URL =
  "https://www.gov.uk/government/organisations/foreign-commonwealth-development-office.atom";

function cleanText(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block: string, tag: string) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = block.match(regex);
  return match ? cleanText(match[1]) : "";
}

function parseEntries(xml: string) {
  return xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
}

function extractLink(block: string) {
  const match = block.match(/<link[^>]+href="([^"]+)"/i);
  return match ? match[1] : "";
}

function isUsefulUkItem(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("transparency")) return false;
  if (text.includes("when someone dies")) return false;
  if (text.includes("policy paper")) return false;
  if (text.includes("guidance")) return false;
  if (text.includes("statistics")) return false;
  if (text.includes("academic technology approval scheme")) return false;

  return true;
}

function buildSignal(
  title: string,
  description: string,
  link: string,
  timestamp: string
): ExternalSignal {
  return {
    source: "UK FCDO",
    sourceType: "Government",
    title,
    description:
      description || "UK Foreign, Commonwealth & Development Office update.",
    timestamp: new Date(timestamp).toISOString(),
    category: "Geopolitics",
    region: "Europe",
    country: "United Kingdom",
    locationLabel: "United Kingdom",
    actors: ["UK Government"],
    keywords: ["uk", "fcdo", "foreign office", "diplomacy", "government"],
    rawUrl: link || UK_FCDO_ATOM_URL,
    confidenceSeed: "High",
  };
}

async function fetchAtom(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/atom+xml, application/xml, text/xml",
    },
  });

  if (!response.ok) {
    throw new Error(`UK FCDO feed failed: ${response.status}`);
  }

  return response.text();
}

export const ukFcdoSource: SignalSource = {
  key: "uk-fcdo",
  displayName: "UK FCDO",

  async fetchSignals(): Promise<SignalSourceResult> {
    try {
      const xml = await fetchAtom(UK_FCDO_ATOM_URL);
      const entries = parseEntries(xml);

      const signals: ExternalSignal[] = entries
        .slice(0, 25)
        .map((entry) => {
          const title = extractTag(entry, "title") || "UK update";
          const description = extractTag(entry, "summary");
          const link = extractLink(entry);
          const updated =
            extractTag(entry, "updated") || new Date().toISOString();

          return { title, description, link, updated };
        })
        .filter((item) => isUsefulUkItem(item.title, item.description))
        .slice(0, 10)
        .map((item) =>
          buildSignal(item.title, item.description, item.link, item.updated)
        );

      return {
        sourceKey: "uk-fcdo",
        fetchedCount: signals.length,
        signals,
      };
    } catch (error) {
      console.error("UK FCDO feed error:", error);

      return {
        sourceKey: "uk-fcdo",
        fetchedCount: 0,
        signals: [],
      };
    }
  },
};