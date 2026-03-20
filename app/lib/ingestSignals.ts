import { prisma } from "./prisma";
import type { ExternalSignal } from "./signalSources/types";

type ProcessingResult = {
  signalTitle: string;
  status: "inserted" | "duplicate";
};

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

function generateFingerprint(signal: {
  title: string;
  locationLabel: string;
  category: string;
}): string {
  return [
    normalizeText(signal.title),
    normalizeText(signal.locationLabel),
    normalizeText(signal.category),
  ].join("|");
}

function confidenceScoreFromSeed(seed?: string): number {
  const normalized = (seed ?? "Medium").toLowerCase();

  if (normalized === "high") return 90;
  if (normalized === "medium") return 60;
  return 35;
}

function importanceFromCategory(category: string): {
  importanceLabel: string;
  importanceScore: number;
} {
  const normalized = category.toLowerCase();

  if (normalized === "military") {
    return {
      importanceLabel: "High Priority",
      importanceScore: 80,
    };
  }

  if (normalized === "disaster") {
    return {
      importanceLabel: "High Priority",
      importanceScore: 75,
    };
  }

  if (normalized === "weather") {
    return {
      importanceLabel: "Medium Importance",
      importanceScore: 55,
    };
  }

  if (normalized === "infrastructure") {
    return {
      importanceLabel: "Medium Importance",
      importanceScore: 50,
    };
  }

  return {
    importanceLabel: "Medium Importance",
    importanceScore: 50,
  };
}

export async function ingestSignals(signals: ExternalSignal[]) {
  const processingResults: ProcessingResult[] = [];
  const insertedEvents = [];

  const recentEvents = await prisma.event.findMany({
    orderBy: { eventTime: "desc" },
    take: 500,
  });

  const existingFingerprints = new Set(
    recentEvents.map((event) =>
      generateFingerprint({
        title: event.title,
        locationLabel: event.locationLabel,
        category: event.category,
      })
    )
  );

  for (const signal of signals) {
    const fingerprint = generateFingerprint({
      title: signal.title,
      locationLabel: signal.locationLabel,
      category: signal.category,
    });

    if (existingFingerprints.has(fingerprint)) {
      processingResults.push({
        signalTitle: signal.title,
        status: "duplicate",
      });
      continue;
    }

    const slugBase = signal.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const confidenceScore = confidenceScoreFromSeed(signal.confidenceSeed);
    const { importanceLabel, importanceScore } = importanceFromCategory(
      signal.category
    );

    const newEvent = await prisma.event.create({
      data: {
        title: signal.title,
        description: signal.description,
        slug: `${slugBase}-${Date.now()}`,
        eventTime: new Date(signal.timestamp),
        region: signal.region,
        country: signal.country,
        locationLabel: signal.locationLabel,
        category: signal.category,
        confidenceLabel: signal.confidenceSeed ?? "Medium",
        confidenceScore,
        importanceLabel,
        importanceScore,
        status: "Active",
        sourceCount: 1,
        sourcesJson: [signal.source],
        timelineJson: [
          `${new Date(signal.timestamp).toUTCString()} — ${signal.source} reported: ${signal.title}`,
        ],
      },
    });

    existingFingerprints.add(fingerprint);
    insertedEvents.push(newEvent);

    processingResults.push({
      signalTitle: signal.title,
      status: "inserted",
    });
  }

  return {
    insertedCount: insertedEvents.length,
    processingResults,
    reports: insertedEvents,
  };
}