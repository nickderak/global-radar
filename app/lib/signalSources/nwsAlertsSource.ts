import type { ExternalSignal, SignalSource, SignalSourceResult } from "./types";

type NwsAlertFeature = {
  id: string;
  properties: {
    id?: string;
    areaDesc?: string | null;
    sent?: string | null;
    effective?: string | null;
    onset?: string | null;
    expires?: string | null;
    ends?: string | null;
    status?: string | null;
    messageType?: string | null;
    category?: string | null;
    severity?: string | null;
    certainty?: string | null;
    urgency?: string | null;
    event?: string | null;
    headline?: string | null;
    description?: string | null;
    instruction?: string | null;
    response?: string | null;
    senderName?: string | null;
  };
};

type NwsAlertsFeed = {
  features?: NwsAlertFeature[];
};

const NWS_ACTIVE_ALERTS_URL =
  "https://api.weather.gov/alerts/active?status=actual";

function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}…`;
}

function locationLabelFromArea(areaDesc: string): string {
  if (!areaDesc) return "United States";
  const first = areaDesc.split(";")[0]?.trim();
  return first || "United States";
}

function confidenceFromSeverity(severity: string): string {
  const normalized = severity.toLowerCase();

  if (["extreme", "severe"].includes(normalized)) return "High";
  if (["moderate"].includes(normalized)) return "Medium";
  return "Low";
}

function categoryFromEvent(eventName: string): string {
  const normalized = eventName.toLowerCase();

  if (
    normalized.includes("tornado") ||
    normalized.includes("thunderstorm") ||
    normalized.includes("hurricane") ||
    normalized.includes("typhoon") ||
    normalized.includes("storm") ||
    normalized.includes("wind")
  ) {
    return "Weather";
  }

  if (
    normalized.includes("flood") ||
    normalized.includes("rain") ||
    normalized.includes("snow") ||
    normalized.includes("blizzard") ||
    normalized.includes("ice")
  ) {
    return "Weather";
  }

  if (
    normalized.includes("fire") ||
    normalized.includes("red flag") ||
    normalized.includes("smoke")
  ) {
    return "Disaster";
  }

  if (
    normalized.includes("heat") ||
    normalized.includes("cold") ||
    normalized.includes("freeze")
  ) {
    return "Weather";
  }

  if (normalized.includes("tsunami")) {
    return "Disaster";
  }

  return "Weather";
}

function buildKeywords(eventName: string, areaDesc: string, severity: string): string[] {
  const tokens = [
    "weather",
    "noaa",
    "nws",
    eventName,
    areaDesc,
    severity,
  ]
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  return Array.from(new Set(tokens)).slice(0, 15);
}

function featureToSignal(feature: NwsAlertFeature): ExternalSignal | null {
  const props = feature.properties;
  if (!props) return null;

  const eventName = safeString(props.event, "Weather Alert");
  const areaDesc = normalizeWhitespace(safeString(props.areaDesc, "United States"));
  const headline = normalizeWhitespace(safeString(props.headline, eventName));
  const description = normalizeWhitespace(
    safeString(props.description, "National Weather Service alert issued.")
  );
  const severity = safeString(props.severity, "Unknown");
  const sent =
    safeString(props.effective) ||
    safeString(props.onset) ||
    safeString(props.sent) ||
    new Date().toISOString();

  const locationLabel = locationLabelFromArea(areaDesc);

  return {
    source: "NWS",
    sourceType: "Government",
    title: truncate(headline || `${eventName} issued for ${locationLabel}`, 180),
    description: truncate(description, 400),
    timestamp: new Date(sent).toISOString(),
    category: categoryFromEvent(eventName),
    region: "North America",
    country: "United States",
    locationLabel,
    actors: ["National Weather Service"],
    keywords: buildKeywords(eventName, areaDesc, severity),
    rawUrl: `https://api.weather.gov/alerts/${feature.id}`,
    confidenceSeed: confidenceFromSeverity(severity),
  };
}

export const nwsAlertsSource: SignalSource = {
  key: "nws-alerts",
  displayName: "NOAA / NWS Active Alerts",

  async fetchSignals(): Promise<SignalSourceResult> {
    const response = await fetch(NWS_ACTIVE_ALERTS_URL, {
      cache: "no-store",
      headers: {
        "User-Agent": "GlobalRadar/1.0 (external alert ingestion)",
        Accept: "application/geo+json, application/ld+json, application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`NWS alerts request failed with status ${response.status}`);
    }

    const data = (await response.json()) as NwsAlertsFeed;

    const signals = (data.features ?? [])
      .map(featureToSignal)
      .filter((item): item is ExternalSignal => item !== null)
      .slice(0, 50);

    return {
      sourceKey: "nws-alerts",
      fetchedCount: signals.length,
      signals,
    };
  },
};