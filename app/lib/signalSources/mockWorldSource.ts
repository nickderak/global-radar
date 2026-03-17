import type { ExternalSignal, SignalSource, SignalSourceResult } from "./types";

type PartialSignal = Omit<ExternalSignal, "timestamp"> & {
  timestamp?: string;
};

function buildSignal(signal: PartialSignal): ExternalSignal {
  return {
    ...signal,
    timestamp: signal.timestamp ?? new Date().toISOString(),
    confidenceSeed: signal.confidenceSeed ?? "Medium",
    actors: signal.actors ?? [],
    keywords: signal.keywords ?? [],
    rawUrl: signal.rawUrl ?? "https://example.com/mock-source",
  };
}

export const mockWorldSource: SignalSource = {
  key: "mock-world",
  displayName: "Mock World Source",

  async fetchSignals(): Promise<SignalSourceResult> {
    const signals: ExternalSignal[] = [
      buildSignal({
        source: "Mock Global Desk",
        sourceType: "Monitoring Service",
        title: "Port congestion reported near Singapore shipping lane",
        description:
          "Monitoring services indicate temporary congestion affecting vessel movement near a major Singapore corridor.",
        category: "Infrastructure",
        region: "Asia-Pacific",
        country: "Singapore",
        locationLabel: "Singapore shipping lane",
        actors: ["Port Monitors"],
        keywords: ["shipping", "congestion", "singapore", "port"],
      }),
      buildSignal({
        source: "Mock Seismic Monitor",
        sourceType: "Government",
        title: "Seismic activity reported near northern Chile",
        description:
          "Regional monitoring systems detected a moderate seismic event near northern Chile.",
        category: "Disaster",
        region: "South America",
        country: "Chile",
        locationLabel: "Northern Chile",
        actors: ["Regional Seismic Agency"],
        keywords: ["earthquake", "seismic", "chile"],
        confidenceSeed: "High",
      }),
    ];

    return {
      sourceKey: "mock-world",
      fetchedCount: signals.length,
      signals,
    };
  },
};