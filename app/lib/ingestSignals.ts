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

function confidenceScoreFromSeed(seed?: string): number {
  const normalized = (seed ?? "Medium").toLowerCase();
  if (normalized === "high") return 90;
  if (normalized === "medium") return 60;
  return 35;
}

function importanceFromCategory(category: string) {
  const normalized = category.toLowerCase();

  if (normalized === "disaster") {
    return { importanceLabel: "High Priority", importanceScore: 75 };
  }

  if (normalized === "weather") {
    return { importanceLabel: "Medium Importance", importanceScore: 55 };
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

  const fingerprintMap = new Map<
    string,
    typeof recentEvents[number]
  >();

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
      // MERGE LOGIC
      const existingSources = Array.isArray(existingEvent.sourcesJson)
        ? existingEvent.sourcesJson
        : [];

      if (!existingSources.includes(signal.source)) {
        const updatedSources = [...existingSources, signal.source];

        const updatedTimeline = [
          ...(Array.isArray(existingEvent.timelineJson)
            ? existingEvent.timelineJson
            : []),
          `${new Date(signal.timestamp).toUTCString()} — ${signal.source} reported`,
        ];

        await prisma.event.update({
          where: { id: existingEvent.id },
          data: {
            sourceCount: updatedSources.length,
            sourcesJson: updatedSources,
            timelineJson: updatedTimeline,
          },
        });
      }

      processingResults.push({
        signalTitle: signal.title,
        status: "merged",
      });

      continue;
    }

    // INSERT NEW EVENT
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