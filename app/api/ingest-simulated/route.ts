import { NextResponse } from "next/server";
import { ingestSignals } from "../../lib/ingestSignals";
import { logIngestionRun } from "../../lib/logIngestionRun";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const testSignals = [
      {
        source: "Reuters",
        sourceType: "News Wire",
        title: "Shipping disruption reported near Red Sea corridor",
        description:
          "New monitoring indicates possible disruption affecting regional maritime traffic near the Red Sea corridor.",
        timestamp: new Date().toISOString(),
        category: "Infrastructure",
        region: "Middle East",
        country: "Yemen",
        locationLabel: "Red Sea corridor",
        actors: ["Regional Maritime Monitors"],
        keywords: ["shipping", "red sea", "disruption", "maritime"],
        rawUrl: "https://example.com/red-sea-update",
        confidenceSeed: "Medium",
      },
      {
        source: "AP",
        sourceType: "News Wire",
        title: "Military activity reported near Taiwan Strait",
        description:
          "Monitoring sources report increased military activity and maritime maneuvering near the Taiwan Strait.",
        timestamp: new Date().toISOString(),
        category: "Military",
        region: "East Asia",
        country: "Taiwan",
        locationLabel: "Taiwan Strait",
        actors: ["Regional Defense Monitors"],
        keywords: ["taiwan", "military", "strait", "naval"],
        rawUrl: "https://example.com/taiwan-strait-update",
        confidenceSeed: "Medium",
      },
    ];

    const result = await ingestSignals(testSignals);

    const run = await logIngestionRun({
      runType: "test",
      generatedCount: testSignals.length,
      insertedCount: result.insertedCount,
      processingResults: result.processingResults,
    });

    return NextResponse.json({
      status: "ok",
      runId: run.id,
      insertedCount: result.insertedCount,
      reportIds: result.reports.map((report: { id: string }) => report.id),
      processingResults: result.processingResults,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown test ingestion error";

    return NextResponse.json(
      {
        status: "error",
        message,
      },
      { status: 500 }
    );
  }
}