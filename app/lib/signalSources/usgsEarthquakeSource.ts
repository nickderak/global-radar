import type { ExternalSignal, SignalSource, SignalSourceResult } from "./types";

type UsgsFeature = {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    updated: number;
    url: string | null;
    detail: string | null;
    status: string | null;
    tsunami: number | null;
    sig: number | null;
    type: string | null;
    title: string | null;
  };
  geometry: {
    type: string;
    coordinates: [number, number, number];
  } | null;
};

type UsgsFeed = {
  type: string;
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    count: number;
  };
  features: UsgsFeature[];
};

const USGS_ALL_HOUR_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function magnitudeLabel(mag: number | null): string {
  if (typeof mag !== "number") return "Earthquake";
  return `M${mag.toFixed(1)} Earthquake`;
}

function parseLocationLabel(place: string): string {
  if (!place) return "Unknown location";

  if (place.includes(" of ")) {
    const parts = place.split(" of ");
    return parts[parts.length - 1].trim();
  }

  return place.trim();
}

function parseCountryFromPlace(place: string): string {
  if (!place) return "Unknown";

  const normalized = place.toLowerCase();

  if (normalized.includes("alaska")) return "United States";
  if (normalized.includes("california")) return "United States";
  if (normalized.includes("hawaii")) return "United States";
  if (normalized.includes("nevada")) return "United States";
  if (normalized.includes("puerto rico")) return "Puerto Rico";
  if (normalized.includes("japan")) return "Japan";
  if (normalized.includes("chile")) return "Chile";
  if (normalized.includes("mexico")) return "Mexico";
  if (normalized.includes("indonesia")) return "Indonesia";
  if (normalized.includes("philippines")) return "Philippines";
  if (normalized.includes("new zealand")) return "New Zealand";
  if (normalized.includes("taiwan")) return "Taiwan";
  if (normalized.includes("russia")) return "Russia";
  if (normalized.includes("turkey")) return "Turkey";
  if (normalized.includes("greece")) return "Greece";
  if (normalized.includes("peru")) return "Peru";
  if (normalized.includes("argentina")) return "Argentina";
  if (normalized.includes("vanuatu")) return "Vanuatu";
  if (normalized.includes("tonga")) return "Tonga";
  if (normalized.includes("fiji")) return "Fiji";

  const parts = place.split(",");
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }

  return "Unknown";
}

function mapRegionFromCountry(country: string): string {
  const normalized = country.toLowerCase();

  if (
    ["united states", "puerto rico", "canada", "mexico"].includes(normalized)
  ) {
    return "North America";
  }

  if (
    ["chile", "peru", "argentina", "brazil", "ecuador"].includes(normalized)
  ) {
    return "South America";
  }

  if (
    [
      "japan",
      "taiwan",
      "philippines",
      "indonesia",
      "vanuatu",
      "tonga",
      "fiji",
      "new zealand",
    ].includes(normalized)
  ) {
    return "Asia-Pacific";
  }

  if (["russia", "greece", "turkey", "italy"].includes(normalized)) {
    return "Europe";
  }

  return "Global";
}

function confidenceSeedFromMagnitude(mag: number | null): string {
  if (typeof mag !== "number") return "Medium";
  if (mag >= 6) return "High";
  if (mag >= 4.5) return "Medium";
  return "Low";
}

function keywordsFromFeature(
  mag: number | null,
  place: string,
  tsunami: number | null
): string[] {
  const keywords = ["earthquake", "seismic", "usgs"];

  if (typeof mag === "number") {
    keywords.push(`magnitude-${Math.floor(mag)}`);
  }

  if (place) {
    const cleaned = place
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 6);

    keywords.push(...cleaned);
  }

  if (tsunami === 1) {
    keywords.push("tsunami");
  }

  return Array.from(new Set(keywords));
}

function featureToSignal(feature: UsgsFeature): ExternalSignal | null {
  if (!feature.properties) return null;

  const mag = feature.properties.mag;
  const place = safeString(feature.properties.place, "Unknown location");
  const locationLabel = parseLocationLabel(place);
  const country = parseCountryFromPlace(place);
  const region = mapRegionFromCountry(country);
  const tsunami = feature.properties.tsunami;

  const title =
    typeof mag === "number"
      ? `${magnitudeLabel(mag)} reported near ${locationLabel}`
      : `Earthquake reported near ${locationLabel}`;

  const descriptionParts = [
    `USGS detected an earthquake event near ${place}.`,
  ];

  if (typeof mag === "number") {
    descriptionParts.push(`Magnitude ${mag.toFixed(1)}.`);
  }

  if (tsunami === 1) {
    descriptionParts.push("Tsunami flag present in source feed.");
  }

  const coordinates = feature.geometry?.coordinates;
  if (coordinates && coordinates.length >= 3) {
    descriptionParts.push(
      `Depth approximately ${coordinates[2].toFixed(1)} km.`
    );
  }

  return {
    source: "USGS",
    sourceType: "Government",
    title,
    description: descriptionParts.join(" "),
    timestamp: new Date(feature.properties.time).toISOString(),
    category: "Disaster",
    region,
    country,
    locationLabel,
    actors: ["USGS"],
    keywords: keywordsFromFeature(mag, place, tsunami),
    rawUrl: safeString(feature.properties.url, "https://earthquake.usgs.gov/"),
    confidenceSeed: confidenceSeedFromMagnitude(mag),
  };
}

export const usgsEarthquakeSource: SignalSource = {
  key: "usgs-earthquakes",
  displayName: "USGS Earthquake Feed",

  async fetchSignals(): Promise<SignalSourceResult> {
    const response = await fetch(USGS_ALL_HOUR_URL, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`USGS feed request failed with status ${response.status}`);
    }

    const data = (await response.json()) as UsgsFeed;

    const signals = (data.features ?? [])
      .map(featureToSignal)
      .filter((item): item is ExternalSignal => item !== null);

    return {
      sourceKey: this.key,
      fetchedCount: signals.length,
      signals,
    };
  },
};