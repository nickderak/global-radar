import Link from "next/link";
import { prisma } from "../lib/prisma";
import AutoRefresh from "../components/AutoRefresh";
import { isWatchlistMatch } from "../lib/watchlistFilter";

type EventFeedItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  eventTime: Date;
  region: string;
  category: string;
  confidenceLabel: string;
  importanceLabel: string;
  importanceScore: number;
  status: string;
  sourceCount: number;
  sourcesJson: unknown;
};

function getConfidenceBadgeClass(value: string) {
  const normalized = value.toLowerCase();

  if (normalized === "high") {
    return "border-green-700 bg-green-950 text-green-300";
  }

  if (normalized === "medium") {
    return "border-yellow-700 bg-yellow-950 text-yellow-300";
  }

  return "border-red-700 bg-red-950 text-red-300";
}

function getImportanceBadgeClass(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("global")) {
    return "border-red-700 bg-red-950 text-red-300";
  }

  if (normalized.includes("high")) {
    return "border-purple-700 bg-purple-950 text-purple-300";
  }

  if (normalized.includes("medium")) {
    return "border-blue-700 bg-blue-950 text-blue-300";
  }

  return "border-gray-700 bg-gray-950 text-gray-300";
}

function getStatusBadgeClass(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("active")) {
    return "border-blue-700 bg-blue-950 text-blue-300";
  }

  if (normalized.includes("monitor")) {
    return "border-yellow-700 bg-yellow-950 text-yellow-300";
  }

  if (normalized.includes("resolved")) {
    return "border-green-700 bg-green-950 text-green-300";
  }

  return "border-gray-700 bg-gray-950 text-gray-300";
}

function safeSources(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

function getEventCardClass(importanceLabel: string) {
  const normalized = importanceLabel.toLowerCase();

  if (normalized.includes("global")) {
    return "border border-red-700 bg-red-950/20";
  }

  if (normalized.includes("high")) {
    return "border border-purple-700 bg-purple-950/20";
  }

  return "border border-gray-800 bg-gray-950";
}

export default async function EventsPage() {
  const allEventsRaw = await prisma.event.findMany({
    orderBy: [{ importanceScore: "desc" }, { eventTime: "desc" }],
  });

  const events: EventFeedItem[] = allEventsRaw.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    eventTime: event.eventTime,
    region: event.region,
    category: event.category,
    confidenceLabel: event.confidenceLabel,
    importanceLabel: event.importanceLabel,
    importanceScore: event.importanceScore,
    status: event.status,
    sourceCount: event.sourceCount,
    sourcesJson: event.sourcesJson,
  }));

  const watchlistEvents = events.filter((event) => isWatchlistMatch(event));
  const activeEvents = events.filter((event) =>
    event.status.toLowerCase().includes("active")
  );
  const topPriorityEvents = events.filter((event) => {
    const normalized = event.importanceLabel.toLowerCase();
    return normalized.includes("global") || normalized.includes("high");
  });

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <AutoRefresh intervalMs={5000} />

      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-gray-800 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
                GLOBAL RADAR
              </p>
              <h1 className="text-4xl font-bold">Event Feed</h1>
              <p className="mt-3 text-gray-300">
                Live global event intelligence feed with watchlist visibility,
                live status, and source-aware prioritization.
              </p>
            </div>

            <div className="rounded-lg border border-green-700 bg-green-950 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-400" />
                </span>

                <div>
                  <p className="text-sm font-semibold text-green-300">
                    Live Monitoring Active
                  </p>
                  <p className="text-xs text-green-400">
                    {activeEvents.length} active event
                    {activeEvents.length === 1 ? "" : "s"} in feed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm text-gray-500">Total Visible Events</p>
            <p className="mt-2 text-3xl font-bold text-white">{events.length}</p>
          </div>

          <div className="rounded-lg border border-red-800 bg-red-950/10 p-5">
            <p className="text-sm text-gray-500">Watchlist Alerts</p>
            <p className="mt-2 text-3xl font-bold text-red-300">
              {watchlistEvents.length}
            </p>
          </div>

          <div className="rounded-lg border border-blue-800 bg-blue-950/10 p-5">
            <p className="text-sm text-gray-500">Active Events</p>
            <p className="mt-2 text-3xl font-bold text-blue-300">
              {activeEvents.length}
            </p>
          </div>
        </section>

        {watchlistEvents.length > 0 && (
          <section className="mb-8 rounded-lg border border-red-800 bg-red-950 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-red-300">
                Watchlist Alerts
              </h2>

              <span className="text-sm text-red-400">
                {watchlistEvents.length} match
                {watchlistEvents.length === 1 ? "" : "es"}
              </span>
            </div>

            <div className="space-y-3">
              {watchlistEvents.slice(0, 5).map((event) => (
                <Link
                  key={`watch-${event.id}`}
                  href={`/events/${event.slug}`}
                  className="block rounded border border-red-700 bg-black p-4 transition hover:border-red-500"
                >
                  <p className="font-semibold text-white">{event.title}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {event.region} · {event.category}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {topPriorityEvents.length > 0 && (
          <section className="mb-8 rounded-lg border border-red-800 bg-red-950/10 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-red-300">
                Top Priority Events
              </h2>
              <p className="text-sm text-gray-400">
                Highest-priority live events in the current feed.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {topPriorityEvents.slice(0, 4).map((event) => (
                <Link
                  key={`top-${event.id}`}
                  href={`/events/${event.slug}`}
                  className={`block rounded-lg p-5 transition hover:border-gray-600 ${getEventCardClass(
                    event.importanceLabel
                  )}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">{event.title}</h2>
                      <p className="mt-2 text-sm text-gray-400">
                        {event.region} · {event.category}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {new Date(event.eventTime).toUTCString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span
                        className={`rounded border px-2 py-1 ${getConfidenceBadgeClass(
                          event.confidenceLabel
                        )}`}
                      >
                        {event.confidenceLabel} Confidence
                      </span>

                      <span
                        className={`rounded border px-2 py-1 ${getImportanceBadgeClass(
                          event.importanceLabel
                        )}`}
                      >
                        {event.importanceLabel}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-gray-300">
                    {event.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="space-y-4">
          {events.map((event) => {
            const sources = safeSources(event.sourcesJson);

            return (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className={`block rounded-lg p-5 transition hover:border-gray-600 ${getEventCardClass(
                  event.importanceLabel
                )}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">{event.title}</h2>
                    <p className="mt-2 text-sm text-gray-400">
                      {event.region} · {event.category}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {new Date(event.eventTime).toUTCString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span
                      className={`rounded border px-2 py-1 ${getConfidenceBadgeClass(
                        event.confidenceLabel
                      )}`}
                    >
                      {event.confidenceLabel}
                    </span>

                    <span
                      className={`rounded border px-2 py-1 ${getImportanceBadgeClass(
                        event.importanceLabel
                      )}`}
                    >
                      {event.importanceLabel}
                    </span>

                    <span
                      className={`rounded border px-2 py-1 ${getStatusBadgeClass(
                        event.status
                      )}`}
                    >
                      {event.status}
                    </span>

                    <span className="rounded border border-gray-700 bg-black px-2 py-1 text-gray-300">
                      {event.sourceCount} Sources
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-300">
                  {event.description}
                </p>

                {sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sources.slice(0, 4).map((source, index) => (
                      <span
                        key={`${event.id}-source-${index}`}
                        className="rounded border border-gray-700 px-2 py-1 text-xs"
                      >
                        {source}
                      </span>
                    ))}

                    {sources.length > 4 && (
                      <span className="rounded border border-gray-700 px-2 py-1 text-xs text-gray-400">
                        +{sources.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}