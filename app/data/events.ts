import type { EventRecord } from "../types/event";

export const events: EventRecord[] = [
  {
    id: "evt_001",
    slug: "red-sea-shipping-corridor",
    title: "Explosion reported near Red Sea shipping corridor",
    description:
      "Initial reports indicate a possible disruption near a major shipping route.",

    eventTime: "2026-03-10T14:32:00Z",
    createdAt: "2026-03-10T14:35:00Z",
    updatedAt: "2026-03-10T14:55:00Z",

    category: "Infrastructure",
    region: "Middle East",
    country: "Yemen",
    locationLabel: "Red Sea shipping corridor",

    confidenceScore: 80,
    confidenceLabel: "High",

    importanceScore: 72,
    importanceLabel: "High",

    status: "Confirmed",

    sourceCount: 3,
    sources: ["Reuters", "BBC", "Regional Maritime Authority"],

    timeline: [
      "14:32 UTC — Initial report of explosion near Red Sea shipping corridor",
      "14:41 UTC — Reuters cites regional shipping sources",
      "14:55 UTC — Maritime authority begins review of traffic conditions",
    ],
  },

  {
    id: "evt_002",
    slug: "central-bank-emergency-meeting",
    title: "Emergency central bank meeting reported",
    description:
      "Officials reportedly convened an unscheduled meeting following currency volatility.",

    eventTime: "2026-03-10T13:05:00Z",
    createdAt: "2026-03-10T13:08:00Z",
    updatedAt: "2026-03-10T13:30:00Z",

    category: "Economics",
    region: "Europe",
    country: "Switzerland",
    locationLabel: "Zurich",

    confidenceScore: 65,
    confidenceLabel: "Medium",

    importanceScore: 68,
    importanceLabel: "High",

    status: "Developing",

    sourceCount: 2,
    sources: ["Bloomberg", "Financial Times"],

    timeline: [
      "13:05 UTC — Traders report unusual central bank activity",
      "13:12 UTC — Financial media begins reporting emergency discussions",
      "13:30 UTC — Officials decline comment",
    ],
  },

  {
    id: "evt_003",
    slug: "earthquake-near-tokyo",
    title: "Moderate earthquake detected near Tokyo",
    description:
      "Seismic sensors detected a moderate earthquake offshore with no immediate damage reports.",

    eventTime: "2026-03-10T11:18:00Z",
    createdAt: "2026-03-10T11:20:00Z",
    updatedAt: "2026-03-10T11:28:00Z",

    category: "Disaster",
    region: "Asia-Pacific",
    country: "Japan",
    locationLabel: "Offshore Tokyo",

    confidenceScore: 90,
    confidenceLabel: "High",

    importanceScore: 55,
    importanceLabel: "Medium",

    status: "Confirmed",

    sourceCount: 3,
    sources: ["USGS", "Japan Meteorological Agency", "NHK"],

    timeline: [
      "11:18 UTC — Seismic activity detected offshore Tokyo",
      "11:20 UTC — USGS registers magnitude 5.6 quake",
      "11:28 UTC — No major damage reported",
    ],
  },
];