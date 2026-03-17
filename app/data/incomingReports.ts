import type { IncomingReport } from "../types/report";

export const incomingReports: IncomingReport[] = [
  {
    source: "Reuters",
    sourceType: "News Wire",
    title: "Explosion reported near Red Sea shipping corridor",
    description:
      "Initial reports indicate disruption near a major shipping route.",
    timestamp: "2026-03-10T14:32:00Z",
    category: "Infrastructure",
    region: "Middle East",
    country: "Yemen",
    locationLabel: "Red Sea shipping corridor",
    actors: ["Regional Maritime Authority"],
    keywords: ["explosion", "shipping", "red sea"],
    rawUrl: "https://example.com/reuters-red-sea",
    confidenceSeed: "Medium",
  },
  {
    source: "USGS",
    sourceType: "Emergency Agency",
    title: "Earthquake reported near Tokyo",
    description:
      "A strong earthquake was reported near Tokyo, prompting infrastructure checks.",
    timestamp: "2026-03-10T13:20:00Z",
    category: "Natural Disasters",
    region: "Japan",
    country: "Japan",
    locationLabel: "Tokyo",
    actors: ["USGS", "Japan Meteorological Agency"],
    keywords: ["earthquake", "tokyo", "infrastructure"],
    rawUrl: "https://example.com/usgs-tokyo",
    confidenceSeed: "High",
  },
  {
    source: "Central Bank Statement",
    sourceType: "Government",
    title: "Central bank emergency meeting announced",
    description:
      "Officials announced an emergency policy meeting following market stress.",
    timestamp: "2026-03-10T13:55:00Z",
    category: "Finance / Monetary",
    region: "Global",
    country: "Unknown",
    locationLabel: "Central Bank Headquarters",
    actors: ["Central Bank"],
    keywords: ["central bank", "meeting", "market stress"],
    rawUrl: "https://example.com/central-bank-meeting",
    confidenceSeed: "High",
  },
];