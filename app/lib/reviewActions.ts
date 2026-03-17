import { prisma } from "./prisma";
import { generateUniqueEventSlug } from "./generateUniqueEventSlug";

function safeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

export async function forceCreateEvent(reportId: string) {
  const report = await prisma.incomingReport.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    return {
      action: "error",
      reason: "report not found",
    };
  }

  const slug = await generateUniqueEventSlug(report.title);

  const createdEvent = await prisma.event.create({
    data: {
      slug,
      title: report.title,
      description: report.description,
      eventTime: report.timestamp,
      category: report.category,
      region: report.region,
      country: report.country,
      locationLabel: report.locationLabel,
      confidenceScore: 50,
      confidenceLabel: "Medium",
      importanceScore: 50,
      importanceLabel: "Medium Importance",
      status: "Active",
      sourceCount: 1,
      sourcesJson: [report.source],
      timelineJson: [
        `${new Date(report.timestamp).toUTCString()} — ${report.source} reported: ${report.title}`,
      ],
    },
  });

  return {
    action: "created",
    eventId: createdEvent.id,
    slug: createdEvent.slug,
  };
}

export async function mergeIntoEvent(reportId: string, eventId: string) {
  const report = await prisma.incomingReport.findUnique({
    where: { id: reportId },
  });

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!report || !event) {
    return {
      action: "error",
      reason: "report or event not found",
    };
  }

  const existingSources = safeArray(event.sourcesJson);
  const existingTimeline = safeArray(event.timelineJson);

  const updatedSources = Array.from(new Set([...existingSources, report.source]));

  const updatedTimeline = [
    ...existingTimeline,
    `${new Date(report.timestamp).toUTCString()} — ${report.source} reported: ${report.title}`,
  ];

  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: {
      sourceCount: updatedSources.length,
      sourcesJson: updatedSources,
      timelineJson: updatedTimeline,
    },
  });

  return {
    action: "merged",
    eventId: updatedEvent.id,
    slug: updatedEvent.slug,
  };
}

export async function approveMerge(reportId: string, eventId: string) {
  return mergeIntoEvent(reportId, eventId);
}