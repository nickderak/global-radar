import { prisma } from "./prisma";
import type { ExternalSignal } from "./signalSources/types";

type ProcessingResult = {
  signalTitle: string;
  status: "inserted" | "merged";
};

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
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

function baseImportanceScoreFromCategory(category: string): number {
  const normalized = category.toLowerCase();

  if (normalized === "military") return 80;
  if (normalized === "geopolitics") return 78;
  if (normalized === "disaster") return 75;
  if (normalized === "weather") return 55;
  if (normalized === "infrastructure") return 50;

  return 50;
}

function importanceFromCategoryAndSources(
  category: string,
  sourceCount: number
): { importanceLabel: string; importanceScore: number } {
  const baseScore = baseImportanceScoreFromCategory(category);
  const adjustedScore = Math.min(baseScore + (sourceCount - 1) * 8, 95);

  if (adjustedScore >= 85) {
    return {
      importanceLabel: "Global Priority",
      importanceScore: adjustedScore,
    };
  }

  if (adjustedScore >= 70) {
    return {
      importanceLabel: "High Priority",
      importanceScore: adjustedScore,
    };
  }

  if (adjustedScore >= 50) {
    return {
      importanceLabel: "Medium Importance",
      importanceScore: adjustedScore,
    };
  }

  return {
    importanceLabel: "Low Importance",
    importanceScore: adjustedScore,
  };
}

function isGeopoliticsCategory(category: string): boolean {
  return normalizeText(category) === "geopolitics";
}

function buildFingerprint(signal: {
  title: string;
  locationLabel: string;
  category: string;
  country: string;
}): string {
  const normalizedCategory = normalizeText(signal.category);

  if (normalizedCategory === "geopolitics") {
    return [
      normalizedCategory,
      normalizeText(signal.country || signal.locationLabel),
      normalizeText(signal.title),
    ].join("|");
  }

  return [
    normalizedCategory,
    normalizeText(signal.locationLabel),
    normalizeText(signal.title),
  ].join("|");
}

export async function ingestSignals(signals: ExternalSignal[]) {
  const processingResults: ProcessingResult[] = [];
  const insertedEvents = [];

  const recentEvents = await prisma.event.findMany({
    orderBy: { eventTime: "desc" },
    take: 1000,
  });

  const fingerprintMap = new Map<string, (typeof recentEvents)[number]>();

  for (const event of recentEvents) {
    const fingerprint = buildFingerprint({
      title: event.title,
      locationLabel: event.locationLabel,
      category: event.category,
      country: event.country,
    });

    fingerprintMap.set(fingerprint, event);
  }

  for (const signal of signals) {
    const fingerprint = buildFingerprint({
      title: signal.title,
      locationLabel: signal.locationLabel,
      category: signal.category,
      country: signal.country,
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

      const baseConfidence = Math.max(
        existingEvent.confidenceScore,
        baseConfidenceScoreFromSeed(signal.confidenceSeed)
      );

      const updatedConfidence = confidenceFromSourceCount(
        updatedSources.length,
        baseConfidence
      );

      const updatedImportance = importanceFromCategoryAndSources(
        existingEvent.category,
        updatedSources.length
      );

      const updatedEvent = await prisma.event.update({
        where: { id: existingEvent.id },
        data: {
          sourceCount: updatedSources.length,
          sourcesJson: updatedSources,
          timelineJson: updatedTimeline,
          confidenceLabel: updatedConfidence.confidenceLabel,
          confidenceScore: updatedConfidence.confidenceScore,
          importanceLabel: updatedImportance.importanceLabel,
          importanceScore: updatedImportance.importanceScore,
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
    const baseConfidence = baseConfidenceScoreFromSeed(signal.confidenceSeed);
    const confidence = confidenceFromSourceCount(sourceCount, baseConfidence);
    const importance = importanceFromCategoryAndSources(
      signal.category,
      sourceCount
    );

    const newEvent = await prisma.event.create({
      data: {
        title: signal.title,
        description: signal.description,
        slug: `${slugBase}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
        eventTime: new Date(signal.timestamp),
        region: signal.region,
        country: signal.country,
        locationLabel: signal.locationLabel,
        category: signal.category,
        confidenceLabel: confidence.confidenceLabel,
        confidenceScore: confidence.confidenceScore,
        importanceLabel: importance.importanceLabel,
        importanceScore: importance.importanceScore,
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