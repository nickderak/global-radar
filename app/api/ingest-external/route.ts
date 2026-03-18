import { NextResponse } from "next/server";
import { runExternalSources } from "../../lib/runExternalSources";
import { logIngestionRun } from "../../lib/logIngestionRun";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await runExternalSources();

    const processingResults =
      result.ingestionResult?.processingResults ?? [];
    const insertedCount =
      result.ingestionResult?.insertedCount ?? 0;
    const reports = result.ingestionResult?.reports ?? [];

    const run = await logIngestionRun({
      runType: "external",
      generatedCount: result.totalSignalsFetched,
      insertedCount,
      processingResults,
    });

    return NextResponse.json({
      status: "ok",
      runId: run.id,
      sourceCount: result.sourceCount,
      sourceResults: result.sourceResults,
      totalSignalsFetched: result.totalSignalsFetched,
      insertedCount,
      reportIds: reports.map((report: { id: string }) => report.id),
      processingResults,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown external ingestion error";

    return NextResponse.json(
      {
        status: "error",
        message,
      },
      { status: 500 }
    );
  }
}