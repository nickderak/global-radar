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
  if (normalized === "moderate") return "Medium";
  return "Low";
}

function categoryFromEvent(eventName: string): string {
  const normalized = eventName.toLowerCase();

  if (
    normalized.includes("tornado") ||
    normalized.includes("thunderstorm") ||
    normalized.includes("hurricane") ||
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
    normalized.includes("ice") ||
    normalized.includes("freeze")
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
    normalized.includes("tsunami")
  ) {
    return "Disaster";
  }

  return "Weather";
}

function importanceSeedFromSeverity(severity: string): string {
  const normalized = severity.toLowerCase();

  if (normalized === "extreme") return "Global Priority";
  if (normalized === "severe") return "High Priority";
  if (normalized === "moderate") return "Medium Importance";
  return "Low Importance";
}

function buildKeywords(
  eventName: string,
  areaDesc: string,
  severity: string
): string[] {
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

function isHighValueAlert(feature: NwsAlertFeature): boolean {
  const props = feature.properties;
  if (!props) return false;

  const severity = safeString(props.severity).toLowerCase();
  const eventName = safeString(props.event).toLowerCase();

  if (["extreme", "severe", "moderate"].includes(severity)) {
    return true;
  }

  if (
    eventName.includes("tornado") ||
    eventName.includes("hurricane") ||
    eventName.includes("tsunami") ||
    eventName.includes("flash flood") ||
    eventName.includes("fire weather") ||
    eventName.includes("red flag")
  ) {
    return true;
  }

  return false;
}

function buildTitle(eventName: string, locationLabel: string): string {
  return `${eventName} issued for ${locationLabel}`;
}

function buildDescription(
  description: string,
  severity: string,
  urgency: string,
  certainty: string
): string {
  const parts: string[] = [];

  if (severity) parts.push(`Severity: ${severity}.`);
  if (urgency) parts.push(`Urgency: ${urgency}.`);
  if (certainty) parts.push(`Certainty: ${certainty}.`);
  if (description) parts.push(description);

  return truncate(normalizeWhitespace(parts.join(" ")), 400);
}

function featureToSignal(feature: NwsAlertFeature): ExternalSignal | null {
  const props = feature.properties;
  if (!props) return null;
  if (!isHighValueAlert(feature)) return null;

  const eventName = safeString(props.event, "Weather Alert");
  const areaDesc = normalizeWhitespace(
    safeString(props.areaDesc, "United States")
  );
  const severity = safeString(props.severity, "Unknown");
  const urgency = safeString(props.urgency, "Unknown");
  const certainty = safeString(props.certainty, "Unknown");
  const description = normalizeWhitespace(
    safeString(props.description, "National Weather Service alert issued.")
  );

  const sent =
    safeString(props.effective) ||
    safeString(props.onset) ||
    safeString(props.sent) ||
    new Date().toISOString();

  const locationLabel = locationLabelFromArea(areaDesc);

  return {
    source: "NWS",
    sourceType: "Government",
    title: truncate(buildTitle(eventName, locationLabel), 180),
    description: buildDescription(description, severity, urgency, certainty),
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
      .slice(0, 40);

    return {
      sourceKey: "nws-alerts",
      fetchedCount: signals.length,
      signals,
    };
  },
};