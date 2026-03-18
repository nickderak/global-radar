import { NextResponse } from "next/server";
import { ingestSignals } from "../../lib/ingestSignals";
import { generateSimulatedSignals } from "../../lib/signalSimulator";
import { logIngestionRun } from "../../lib/logIngestionRun";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
      reportIds: result.reports.map((report: { id: string }) => report.id),
      processingResults: result.processingResults,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown simulated ingestion error";

    return NextResponse.json(
      {
        status: "error",
        message,
      },
      { status: 500 }
    );
  }
}