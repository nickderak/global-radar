import { prisma } from "./prisma";
import type { ExternalSignal } from "./signalSources/types";

type ProcessingResult = {
  signalTitle: string;
  status: "inserted" | "merged";
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

function baseConfidenceScoreFromSeed(seed?: string): number {
  const normalized = (seed ?? "Medium").toLowerCase();

  if (normalized === "high") return 75;
  if (normalized === "medium") return 55;
  return 35;
}

function confidenceFromSourceCount(
  sourceCount: number,
  baseScore: number
): { confidenceLabel: string; confidenceScore: number } {
  const adjustedScore = Math.min(baseScore + (sourceCount - 1) * 12, 95);

  if (adjustedScore >= 80) {
    return {
      confidenceLabel: "High",
      confidenceScore: adjustedScore,
    };
  }

  if (adjustedScore >= 50) {
    return {
      confidenceLabel: "Medium",
      confidenceScore: adjustedScore,
    };
  }

  return {
    confidenceLabel: "Low",
    confidenceScore: adjustedScore,
  };
}

function importanceFromCategory(category: string) {
  const normalized = category.toLowerCase();

  if (normalized === "disaster") {
    return { importanceLabel: "High Priority", importanceScore: 75 };
  }

  if (normalized === "weather") {
    return { importanceLabel: "Medium Importance", importanceScore: 55 };
  }

  if (normalized === "military") {
    return { importanceLabel: "High Priority", importanceScore: 80 };
  }

  return { importanceLabel: "Medium Importance", importanceScore: 50 };
}

export async function ingestSignals(signals: ExternalSignal[]) {
  const processingResults: ProcessingResult[] = [];
  const insertedEvents = [];

  const recentEvents = await prisma.event.findMany({
    orderBy: { eventTime: "desc" },
    take: 500,
  });

  const fingerprintMap = new Map<string, (typeof recentEvents)[number]>();

  for (const event of recentEvents) {
    const fp = generateFingerprint({
      title: event.title,
      locationLabel: event.locationLabel,
      category: event.category,
    });
    fingerprintMap.set(fp, event);
  }

  for (const signal of signals) {
    const fingerprint = generateFingerprint({
      title: signal.title,
      locationLabel: signal.locationLabel,
      category: signal.category,
    });

    const existingEvent = fingerprintMap.get(fingerprint);

    if (existingEvent) {
      const existingSources = Array.isArray(existingEvent.sourcesJson)
        ? existingEvent.sourcesJson.map((item) => String(item))
        : [];

      const updatedSources = existingSources.includes(signal.source)
        ? existingSources
        : [...existingSources, signal.source];

      const updatedTimeline = Array.isArray(existingEvent.timelineJson)
        ? existingEvent.timelineJson.map((item) => String(item))
        : [];

      if (!existingSources.includes(signal.source)) {
        updatedTimeline.push(
          `${new Date(signal.timestamp).toUTCString()} — ${signal.source} reported`
        );
      }

      const baseScore = Math.max(
        existingEvent.confidenceScore,
        baseConfidenceScoreFromSeed(signal.confidenceSeed)
      );

      const updatedConfidence = confidenceFromSourceCount(
        updatedSources.length,
        baseScore
      );

      const updatedEvent = await prisma.event.update({
        where: { id: existingEvent.id },
        data: {
          sourceCount: updatedSources.length,
          sourcesJson: updatedSources,
          timelineJson: updatedTimeline,
          confidenceLabel: updatedConfidence.confidenceLabel,
          confidenceScore: updatedConfidence.confidenceScore,
        },
      });

      fingerprintMap.set(fingerprint, updatedEvent);

      processingResults.push({
        signalTitle: signal.title,
        status: "merged",
      });

      continue;
    }

    const slugBase = signal.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const sourceCount = 1;
    const baseScore = baseConfidenceScoreFromSeed(signal.confidenceSeed);
    const confidence = confidenceFromSourceCount(sourceCount, baseScore);
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
        confidenceLabel: confidence.confidenceLabel,
        confidenceScore: confidence.confidenceScore,
        importanceLabel,
        importanceScore,
        status: "Active",
        sourceCount,
        sourcesJson: [signal.source],
        timelineJson: [
          `${new Date(signal.timestamp).toUTCString()} — ${signal.source} reported`,
        ],
      },
    });

    fingerprintMap.set(fingerprint, newEvent);
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