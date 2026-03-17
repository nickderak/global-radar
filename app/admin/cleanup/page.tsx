import Link from "next/link";
import { prisma } from "../../lib/prisma";
import {
  deleteEventAction,
  deleteIngestionRunAction,
} from "../../lib/adminCleanupActions";

type CleanupEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  eventTime: Date;
  region: string;
  category: string;
  status: string;
  sourceCount: number;
  importanceLabel: string;
  sourcesJson: unknown;
};

type CleanupRun = {
  id: string;
  runType: string;
  generatedCount: number;
  insertedCount: number;
  createdCount: number;
  mergedCount: number;
  reviewCount: number;
  errorCount: number;
  createdAt: Date;
};

function safeSources(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

export default async function AdminCleanupPage() {
  const recentEventsRaw = await prisma.event.findMany({
    orderBy: {
      eventTime: "desc",
    },
    take: 20,
  });

  const recentRunsRaw = await prisma.ingestionRun.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  const recentEvents: CleanupEvent[] = recentEventsRaw.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    eventTime: event.eventTime,
    region: event.region,
    category: event.category,
    status: event.status,
    sourceCount: event.sourceCount,
    importanceLabel: event.importanceLabel,
    sourcesJson: event.sourcesJson,
  }));

  const recentRuns: CleanupRun[] = recentRunsRaw.map((run) => ({
    id: run.id,
    runType: run.runType,
    generatedCount: run.generatedCount,
    insertedCount: run.insertedCount,
    createdCount: run.createdCount,
    mergedCount: run.mergedCount,
    reviewCount: run.reviewCount,
    errorCount: run.errorCount,
    createdAt: run.createdAt,
  }));

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 border-b border-gray-800 pb-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
            GLOBAL RADAR
          </p>
          <h1 className="text-4xl font-bold">Admin Cleanup Tools</h1>
          <p className="mt-3 text-gray-300">
            Remove junk events and ingestion runs without touching the database
            directly.
          </p>
        </header>

        <div className="mb-8 flex flex-wrap gap-3">
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
            href="/debug/ingest"
            className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500"
          >
            Ingestion Status
          </Link>
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <section className="rounded-lg border border-gray-800 bg-gray-950 p-6">
            <h2 className="text-2xl font-semibold">Recent Events</h2>

            {recentEvents.length === 0 ? (
              <p className="mt-4 text-gray-400">No events found.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {recentEvents.map((event: CleanupEvent) => {
                  const sources = safeSources(event.sourcesJson);

                  return (
                    <div
                      key={event.id}
                      className="rounded border border-gray-800 bg-black p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-lg font-semibold">{event.title}</p>
                          <p className="mt-1 text-sm text-gray-400">
                            {event.region} · {event.category}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {new Date(event.eventTime).toUTCString()}
                          </p>
                          <p className="mt-3 text-sm text-gray-300">
                            {event.description}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded border border-gray-700 bg-gray-950 px-2 py-1 text-xs text-gray-300">
                              {event.status}
                            </span>
                            <span className="rounded border border-gray-700 bg-gray-950 px-2 py-1 text-xs text-gray-300">
                              {event.sourceCount} Sources
                            </span>
                            <span className="rounded border border-gray-700 bg-gray-950 px-2 py-1 text-xs text-gray-300">
                              {event.importanceLabel}
                            </span>
                          </div>

                          <div className="mt-3">
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                              Sources
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {sources.length === 0 ? (
                                <span className="text-xs text-gray-500">
                                  No sources recorded
                                </span>
                              ) : (
                                sources.slice(0, 5).map((source, index) => (
                                  <span
                                    key={`${event.id}-${index}`}
                                    className="rounded border border-gray-700 bg-gray-950 px-2 py-1 text-xs text-gray-300"
                                  >
                                    {source}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/events/${event.slug}`}
                            className="rounded border border-blue-700 bg-blue-950 px-3 py-2 text-sm text-blue-300 hover:border-blue-500"
                          >
                            Open
                          </Link>

                          <form action={deleteEventAction}>
                            <input type="hidden" name="eventId" value={event.id} />
                            <button
                              type="submit"
                              className="rounded border border-red-700 bg-red-950 px-3 py-2 text-sm text-red-300 hover:border-red-500"
                            >
                              Delete Event
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-gray-800 bg-gray-950 p-6">
            <h2 className="text-2xl font-semibold">Recent Ingestion Runs</h2>

            {recentRuns.length === 0 ? (
              <p className="mt-4 text-gray-400">No ingestion runs found.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {recentRuns.map((run: CleanupRun) => (
                  <div
                    key={run.id}
                    className="rounded border border-gray-800 bg-black p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold">{run.runType}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {new Date(run.createdAt).toUTCString()}
                        </p>

                        <div className="mt-3 grid gap-2 text-sm text-gray-300 md:grid-cols-2">
                          <p>Generated: {run.generatedCount}</p>
                          <p>Inserted: {run.insertedCount}</p>
                          <p>Created: {run.createdCount}</p>
                          <p>Merged: {run.mergedCount}</p>
                          <p>Review: {run.reviewCount}</p>
                          <p>Errors: {run.errorCount}</p>
                        </div>
                      </div>

                      <form action={deleteIngestionRunAction}>
                        <input type="hidden" name="runId" value={run.id} />
                        <button
                          type="submit"
                          className="rounded border border-red-700 bg-red-950 px-3 py-2 text-sm text-red-300 hover:border-red-500"
                        >
                          Delete Run
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}