import { NextResponse } from "next/server";
import { ingestSignals } from "../../lib/ingestSignals";
import { generateSimulatedSignals } from "../../lib/signalSimulator";
import { logIngestionRun } from "../../lib/logIngestionRun";

export async function GET() {
  const signals = generateSimulatedSignals(3);

  const result = await ingestSignals(signals);

  const run = await logIngestionRun({
    runType: "simulated",
    generatedCount: signals.length,
    insertedCount: result.insertedCount,
    processingResults: result.processingResults,
  });

  return NextResponse.json({
    status: "ok",
    runId: run.id,
    generatedCount: signals.length,
    insertedCount: result.insertedCount,
    reportIds: result.reports.map((report) => report.id),
    processingResults: result.processingResults,
  });
}