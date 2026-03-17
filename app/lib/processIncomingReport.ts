import { prisma } from "./prisma";
import { findBestEventCluster } from "./eventClusterEngine";
import { calculateImportance } from "./importanceEngine";
import { getSourceCredibility } from "./sourceCredibilityEngine";
import { buildTimelineEntry } from "./timelineEngine";
import { evaluateSignalVelocity } from "./velocityEngine";

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

export async function processIncomingReport(reportId: string) {
  const report = await prisma.incomingReport.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    return { action: "error", reason: "report not found" };
  }

  const credibility = getSourceCredibility(report.sourceType);

  const cluster = await findBestEventCluster({
    title: report.title,
    description: report.description,
    category: report.category,
    region: report.region,
    country: report.country,
    locationLabel: report.locationLabel,
    timestamp: report.timestamp,
  });

  if (!cluster) {
    return { action: "create", credibility };
  }

  if (cluster.score >= 65) {
    const event = await prisma.event.findUnique({
      where: { id: cluster.eventId },
    });

    if (!event) {
      return { action: "error", reason: "event not found" };
    }

    const timelineEntry = buildTimelineEntry(report);

    const existingTimeline = safeStringArray(event.timelineJson);
    const existingSources = safeStringArray(event.sourcesJson);

    const updatedTimeline = [...existingTimeline, timelineEntry];
    const updatedSources = Array.from(
      new Set([...existingSources, report.source])
    );

    const updatedEvent = await prisma.event.update({
      where: { id: cluster.eventId },
      data: {
        sourceCount: updatedSources.length,
        confidenceScore: {
          increment: Math.round(credibility.score / 10),
        },
        sourcesJson: updatedSources,
        timelineJson: updatedTimeline,
      },
    });

    const importance = calculateImportance(updatedEvent.sourceCount);
    const velocity = evaluateSignalVelocity(updatedEvent.sourceCount);

    const finalImportanceScore = Math.max(
      importance.score,
      velocity.recommendedImportanceScore
    );

    const finalImportanceLabel =
      finalImportanceScore === velocity.recommendedImportanceScore
        ? velocity.recommendedImportanceLabel
        : importance.label;

    await prisma.event.update({
      where: { id: cluster.eventId },
      data: {
        importanceScore: finalImportanceScore,
        importanceLabel: finalImportanceLabel,
        status: velocity.isBreaking ? "Breaking" : event.status,
      },
    });

    return {
      action: "merged",
      eventId: cluster.eventId,
      credibility,
      importance: {
        score: finalImportanceScore,
        label: finalImportanceLabel,
      },
      velocity,
      matchScore: cluster.score,
      matchReasons: cluster.reasons,
      timelineAdded: timelineEntry,
    };
  }

  if (cluster.score >= 40) {
    return {
      action: "review",
      credibility,
      matchScore: cluster.score,
      matchReasons: cluster.reasons,
    };
  }

  return {
    action: "create",
    credibility,
    matchScore: cluster.score,
    matchReasons: cluster.reasons,
  };
}