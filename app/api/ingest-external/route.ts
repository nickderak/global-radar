import { NextResponse } from "next/server";
import { runExternalSources } from "../../lib/runExternalSources";
import { logIngestionRun } from "../../lib/logIngestionRun";

export async function GET() {
  const result = await runExternalSources();

  const processingResults = result.ingestionResult?.processingResults ?? [];
  const insertedCount = result.ingestionResult?.insertedCount ?? 0;

  const run = await logIngestionRun({
    runType: "external-framework",
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
    processingResults,
  });
}