import { prisma } from "./prisma";
import { normalizeIncomingSignal } from "./normalizeIncomingSignal";
import { processIncomingReport } from "./processIncomingReport";
import { forceCreateEvent } from "./reviewActions";

type RawSignal = {
  source: string;
  sourceType: string;
  title: string;
  description: string;
  timestamp: string;
  category: string;
  region: string;
  country: string;
  locationLabel: string;
  actors?: string[];
  keywords?: string[];
  rawUrl?: string;
  confidenceSeed?: string;
};

export async function ingestSignals(signals: RawSignal[]) {
  const insertedReports = [];
  const processingResults = [];

  for (const signal of signals) {
    const normalized = normalizeIncomingSignal(signal);

    const report = await prisma.incomingReport.create({
      data: normalized,
    });

    insertedReports.push(report);

    const processingResult = await processIncomingReport(report.id);

    let finalResult: unknown = processingResult;

    if (processingResult.action === "create") {
      const createdEventResult = await forceCreateEvent(report.id);

      finalResult = {
        ...processingResult,
        createEventResult: createdEventResult,
      };
    }

    processingResults.push({
      reportId: report.id,
      title: report.title,
      result: finalResult,
    });
  }

  return {
    insertedCount: insertedReports.length,
    reports: insertedReports,
    processingResults,
  };
}