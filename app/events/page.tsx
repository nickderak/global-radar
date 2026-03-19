import Link from "next/link";
import { prisma } from "../lib/prisma";
import AutoRefresh from "../components/AutoRefresh";

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

function safeSources(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
}

type SearchParams = Promise<{
  region?: string;
  category?: string;
  confidence?: string;
  importance?: string;
  status?: string;
}>;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = await searchParams;

  const selectedRegion = filters.region ?? "";
  const selectedCategory = filters.category ?? "";
  const selectedConfidence = filters.confidence ?? "";
  const selectedImportance = filters.importance ?? "";
  const selectedStatus = filters.status ?? "";

  const allEventsRaw = await prisma.event.findMany({
    orderBy: [
      { importanceScore: "desc" },
      { eventTime: "desc" },
    ],
  });

  const allEvents: EventFeedItem[] = allEventsRaw.map(
    (event: {
      id: string;
      slug: string;
      title: string;
      description: string;
      eventTime: Date;
      region: string;
      category: string;
      confidenceLabel: string;
      importanceLabel: string;
      status: string;
      sourceCount: number;
      sourcesJson: unknown;
    }) => ({
      id: event.id,
      slug: event.slug,
      title: event.title,
      description: event.description,
      eventTime: event.eventTime,
      region: event.region,
      category: event.category,
      confidenceLabel: event.confidenceLabel,
      importanceLabel: event.importanceLabel,
      status: event.status,
      sourceCount: event.sourceCount,
      sourcesJson: event.sourcesJson,
    })
  );

  const regionOptions = uniqueSorted(
    allEvents.map((event: EventFeedItem) => event.region)
  );
  const categoryOptions = uniqueSorted(
    allEvents.map((event: EventFeedItem) => event.category)
  );
  const confidenceOptions = uniqueSorted(
    allEvents.map((event: EventFeedItem) => event.confidenceLabel)
  );
  const importanceOptions = uniqueSorted(
    allEvents.map((event: EventFeedItem) => event.importanceLabel)
  );
  const statusOptions = uniqueSorted(
    allEvents.map((event: EventFeedItem) => event.status)
  );

  const events = allEvents.filter((event: EventFeedItem) => {
    if (selectedRegion && event.region !== selectedRegion) return false;
    if (selectedCategory && event.category !== selectedCategory) return false;
    if (selectedConfidence && event.confidenceLabel !== selectedConfidence) {
      return false;
    }
    if (selectedImportance && event.importanceLabel !== selectedImportance) {
      return false;
    }
    if (selectedStatus && event.status !== selectedStatus) return false;

    return true;
  });

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <AutoRefresh intervalMs={5000} />

      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-gray-800 pb-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
            GLOBAL RADAR
          </p>
          <h1 className="text-4xl font-bold">Event Feed</h1>
          <p className="mt-3 text-gray-300">
            Live global event intelligence feed with filters and visible source
            support.
          </p>
        </header>

        <section className="mb-8 rounded-lg border border-gray-800 bg-gray-950 p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Feed Filters</h2>

            <Link
              href="/events"
              className="rounded border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:border-gray-500"
            >
              Clear Filters
            </Link>
          </div>

          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label
                htmlFor="region"
                className="mb-2 block text-sm font-medium text-gray-400"
              >
                Region
              </label>
              <select
                id="region"
                name="region"
                defaultValue={selectedRegion}
                className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="">All Regions</option>
                {regionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-gray-400"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                defaultValue={selectedCategory}
                className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="">All Categories</option>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="confidence"
                className="mb-2 block text-sm font-medium text-gray-400"
              >
                Confidence
              </label>
              <select
                id="confidence"
                name="confidence"
                defaultValue={selectedConfidence}
                className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="">All Confidence</option>
                {confidenceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="importance"
                className="mb-2 block text-sm font-medium text-gray-400"
              >
                Importance
              </label>
              <select
                id="importance"
                name="importance"
                defaultValue={selectedImportance}
                className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="">All Importance</option>
                {importanceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-gray-400"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={selectedStatus}
                className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="">All Status</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 xl:col-span-5 flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="rounded border border-blue-700 bg-blue-950 px-4 py-2 text-sm text-blue-300 hover:border-blue-500"
              >
                Apply Filters
              </button>

              <div className="rounded border border-gray-800 bg-black px-4 py-2 text-sm text-gray-400">
                Showing {events.length} of {allEvents.length} events
              </div>
            </div>
          </form>
        </section>

        {events.length === 0 ? (
          <div className="rounded-lg border border-gray-800 bg-gray-950 p-6 text-gray-400">
            No events match the current filters.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event: EventFeedItem) => {
              const sources = safeSources(event.sourcesJson);

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className={`block rounded-lg p-5 transition hover:border-gray-600 ${
                    event.importanceLabel.toLowerCase().includes("global")
                      ? "border border-red-700 bg-red-950/20"
                      : event.importanceLabel.toLowerCase().includes("high")
                      ? "border border-purple-700 bg-purple-950/20"
                      : "border border-gray-800 bg-gray-950"
                  }`}
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
                        {event.confidenceLabel} Confidence
                      </span>

                      <span
                        className={`rounded border px-2 py-1 ${getImportanceBadgeClass(
                          event.importanceLabel
                        )}`}
                      >
                        {event.importanceLabel}
                      </span>

                      <span className="rounded border border-gray-700 bg-black px-2 py-1 text-gray-300">
                        {event.sourceCount} Sources
                      </span>

                      <span className="rounded border border-gray-700 bg-black px-2 py-1 text-gray-300">
                        {event.status}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-gray-300">
                    {event.description}
                  </p>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Source Support
                    </p>

                    {sources.length === 0 ? (
                      <p className="mt-2 text-sm text-gray-500">
                        No sources recorded.
                      </p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {sources.slice(0, 5).map((source, index) => (
                          <span
                            key={`${event.id}-${index}`}
                            className="rounded border border-gray-700 bg-black px-2 py-1 text-xs text-gray-300"
                          >
                            {source}
                          </span>
                        ))}

                        {sources.length > 5 && (
                          <span className="rounded border border-gray-700 bg-black px-2 py-1 text-xs text-gray-400">
                            +{sources.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}