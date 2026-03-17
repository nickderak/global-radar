import Link from "next/link";
import { prisma } from "../../lib/prisma";
import AutoRefresh from "../../components/AutoRefresh";

export default async function IngestDebugPage() {
  const recentRuns = await prisma.ingestionRun.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  });

  const hottestEvents = await prisma.event.findMany({
    orderBy: {
      importanceScore: "desc",
    },
    take: 5,
  });

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <AutoRefresh intervalMs={5000} />

      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-gray-800 pb-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
            Global Radar
          </p>
          <h1 className="text-4xl font-bold">Live Ingestion Status</h1>
          <p className="mt-3 text-gray-300">
            Control panel and operator log for ingestion runs.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
            <h2 className="text-xl font-semibold">Manual Test Ingestion</h2>
            <div className="mt-4 rounded border border-gray-800 bg-black p-4 text-sm text-green-300">
              /api/ingest-test
            </div>
            <div className="mt-6">
              <Link
                href="/api/ingest-test"
                className="rounded border border-blue-700 bg-blue-950 px-4 py-2 text-sm text-blue-300 hover:border-blue-500"
              >
                Run Test Ingestion
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
            <h2 className="text-xl font-semibold">Simulated Stream Batch</h2>
            <div className="mt-4 rounded border border-gray-800 bg-black p-4 text-sm text-green-300">
              /api/ingest-simulated
            </div>
            <div className="mt-6">
              <Link
                href="/api/ingest-simulated"
                className="rounded border border-red-700 bg-red-950 px-4 py-2 text-sm text-red-300 hover:border-red-500"
              >
                Run Simulated Stream Batch
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
            <h2 className="text-xl font-semibold">External Source Framework</h2>
            <div className="mt-4 rounded border border-gray-800 bg-black p-4 text-sm text-green-300">
              /api/ingest-external
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Runs all registered external source adapters through one framework.
              This now includes the mock source and the real USGS earthquake feed.
            </p>
            <div className="mt-6">
              <Link
                href="/api/ingest-external"
                className="rounded border border-purple-700 bg-purple-950 px-4 py-2 text-sm text-purple-300 hover:border-purple-500"
              >
                Run External Source Framework
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
            <h2 className="text-xl font-semibold">Recent Ingestion Runs</h2>

            {recentRuns.length === 0 ? (
              <p className="mt-4 text-gray-400">No ingestion runs logged yet.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {recentRuns.map((run) => (
                  <div
                    key={run.id}
                    className="rounded border border-gray-800 bg-black p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-wide text-gray-500">
                          {run.runType} run
                        </p>
                        <p className="mt-2 text-sm text-gray-400">
                          {new Date(run.createdAt).toUTCString()}
                        </p>
                      </div>

                      <div className="text-right text-sm text-gray-300">
                        <p>Generated: {run.generatedCount}</p>
                        <p>Inserted: {run.insertedCount}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                      <div className="rounded border border-gray-800 bg-gray-950 p-3">
                        <p className="text-gray-500">Created</p>
                        <p className="mt-1 font-semibold text-white">
                          {run.createdCount}
                        </p>
                      </div>

                      <div className="rounded border border-gray-800 bg-gray-950 p-3">
                        <p className="text-gray-500">Merged</p>
                        <p className="mt-1 font-semibold text-white">
                          {run.mergedCount}
                        </p>
                      </div>

                      <div className="rounded border border-gray-800 bg-gray-950 p-3">
                        <p className="text-gray-500">Review</p>
                        <p className="mt-1 font-semibold text-white">
                          {run.reviewCount}
                        </p>
                      </div>

                      <div className="rounded border border-gray-800 bg-gray-950 p-3">
                        <p className="text-gray-500">Errors</p>
                        <p className="mt-1 font-semibold text-white">
                          {run.errorCount}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
            <h2 className="text-xl font-semibold">Velocity Watch</h2>

            {hottestEvents.length === 0 ? (
              <p className="mt-4 text-gray-400">No events available yet.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {hottestEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded border border-gray-800 bg-black p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{event.title}</p>
                        <p className="mt-1 text-sm text-gray-400">
                          {event.region} · {event.category}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-red-300">{event.status}</p>
                        <p className="text-xs text-gray-500">
                          Sources: {event.sourceCount}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded bg-gray-800">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${Math.min(event.importanceScore, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/events"
            className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500"
          >
            View Events
          </Link>

          <Link
            href="/radar"
            className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500"
          >
            Open Radar
          </Link>

          <Link
            href="/review"
            className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500"
          >
            Open Review Queue
          </Link>
        </div>
      </div>
    </main>
  );
}