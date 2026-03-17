type SimulatedSignal = {
  source: string;
  sourceType: string;
  title: string;
  description: string;
  timestamp: string;
  category: string;
  region: string;
  country: string;
  locationLabel: string;
  actors?: string[];
  keywords?: string[];
  rawUrl?: string;
  confidenceSeed?: string;
};

const signalTemplates: Omit<SimulatedSignal, "timestamp" | "rawUrl">[] = [
  {
    source: "Reuters",
    sourceType: "News Wire",
    title: "Shipping disruption reported near Red Sea corridor",
    description:
      "Monitoring indicates possible disruption affecting maritime traffic near the Red Sea corridor.",
    category: "Infrastructure",
    region: "Middle East",
    country: "Yemen",
    locationLabel: "Red Sea corridor",
    actors: ["Regional Maritime Monitors"],
    keywords: ["shipping", "red sea", "disruption", "maritime"],
    confidenceSeed: "Medium",
  },
  {
    source: "AP",
    sourceType: "News Wire",
    title: "Military activity reported near Taiwan Strait",
    description:
      "Monitoring sources report increased military activity and maritime maneuvering near the Taiwan Strait.",
    category: "Military",
    region: "East Asia",
    country: "Taiwan",
    locationLabel: "Taiwan Strait",
    actors: ["Regional Defense Monitors"],
    keywords: ["taiwan", "military", "strait", "naval"],
    confidenceSeed: "Medium",
  },
  {
    source: "USGS",
    sourceType: "Government",
    title: "Seismic activity detected near central Japan",
    description:
      "A moderate seismic event was detected near central Japan according to official monitoring systems.",
    category: "Disaster",
    region: "Asia-Pacific",
    country: "Japan",
    locationLabel: "Central Japan",
    actors: ["USGS"],
    keywords: ["earthquake", "japan", "seismic"],
    confidenceSeed: "High",
  },
];

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function buildRawUrl(title: string, timestamp: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  return `https://example.com/simulated/${slug}?ts=${encodeURIComponent(timestamp)}`;
}

function slightlyVaryText(text: string) {
  const variants = [
    text,
    `${text} Additional monitoring is underway.`,
    `${text} Preliminary verification is in progress.`,
    `${text} Follow-up confirmation is pending.`,
  ];

  return variants[randomInt(variants.length)];
}

export function generateSimulatedSignals(count = 2): SimulatedSignal[] {
  const now = new Date();
  const chosen: SimulatedSignal[] = [];

  for (let i = 0; i < count; i++) {
    const template = signalTemplates[randomInt(signalTemplates.length)];
    const timestamp = new Date(now.getTime() + i * 1000).toISOString();

    chosen.push({
      ...template,
      description: slightlyVaryText(template.description),
      timestamp,
      rawUrl: buildRawUrl(template.title, timestamp),
    });
  }

  return chosen;
}