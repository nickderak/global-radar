import { prisma } from "./prisma";
import { generateUniqueEventSlug } from "./generateUniqueEventSlug";

export async function createEventFromIncomingReport(reportId: string) {
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