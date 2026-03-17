import { prisma } from "./prisma";

type MatchResult = {
  eventId: string;
  score: number;
  reasons: string[];
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((word) => word.length > 2);
}

function overlapScore(a: string, b: string) {
  const aWords = new Set(tokenize(a));
  const bWords = new Set(tokenize(b));

  if (aWords.size === 0 || bWords.size === 0) {
    return 0;
  }

  let matches = 0;
  for (const word of aWords) {
    if (bWords.has(word)) {
      matches += 1;
    }
  }

  const maxSize = Math.max(aWords.size, bWords.size);
  return Math.round((matches / maxSize) * 100);
}

function hoursBetween(a: Date, b: Date) {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60);
}

function timeScore(reportTime: Date, eventTime: Date) {
  const hours = hoursBetween(reportTime, eventTime);

  if (hours <= 1) return 20;
  if (hours <= 6) return 15;
  if (hours <= 24) return 10;
  if (hours <= 72) return 5;
  return 0;
}

export async function findBestEventCluster(report: {
  title: string;
  description: string;
  category: string;
  region: string;
  country: string;
  locationLabel: string;
  timestamp: Date;
}): Promise<MatchResult | null> {
  const events = await prisma.event.findMany({
    orderBy: { eventTime: "desc" },
    take: 100,
  });

  let best: MatchResult | null = null;

  for (const event of events) {
    let score = 0;
    const reasons: string[] = [];

    const titleSimilarity = overlapScore(report.title, event.title);
    const descriptionSimilarity = overlapScore(
      report.description,
      event.description
    );

    if (titleSimilarity >= 70) {
      score += 35;
      reasons.push(`strong title match (${titleSimilarity})`);
    } else if (titleSimilarity >= 40) {
      score += 20;
      reasons.push(`moderate title match (${titleSimilarity})`);
    } else if (titleSimilarity >= 20) {
      score += 10;
      reasons.push(`light title match (${titleSimilarity})`);
    }

    if (descriptionSimilarity >= 60) {
      score += 20;
      reasons.push(`strong description match (${descriptionSimilarity})`);
    } else if (descriptionSimilarity >= 30) {
      score += 10;
      reasons.push(`moderate description match (${descriptionSimilarity})`);
    }

    if (event.category === report.category) {
      score += 15;
      reasons.push("category match");
    }

    if (event.region === report.region) {
      score += 10;
      reasons.push("region match");
    }

    if (event.country === report.country) {
      score += 10;
      reasons.push("country match");
    }

    if (
      normalizeText(event.locationLabel) === normalizeText(report.locationLabel)
    ) {
      score += 10;
      reasons.push("exact location match");
    } else if (
      overlapScore(event.locationLabel, report.locationLabel) >= 50
    ) {
      score += 5;
      reasons.push("partial location match");
    }

    const eventTimeValue =
      event.eventTime instanceof Date ? event.eventTime : new Date(event.eventTime);

    const freshnessScore = timeScore(report.timestamp, eventTimeValue);
    if (freshnessScore > 0) {
      score += freshnessScore;
      reasons.push(`time proximity (+${freshnessScore})`);
    }

    if (!best || score > best.score) {
      best = {
        eventId: event.id,
        score,
        reasons,
      };
    }
  }

  return best;
}
