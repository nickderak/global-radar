import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { notFound } from "next/navigation";

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

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

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
  });

  if (!event) {
    notFound();
  }

  const timeline = safeStringArray(event.timelineJson);
  const sources = safeStringArray(event.sourcesJson);

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/events"
            className="text-sm text-gray-400 underline hover:text-white"
          >
            Back to Event Feed
          </Link>
        </div>

        <header className="rounded-lg border border-gray-800 bg-gray-950 p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
            Global Squawk Box
          </p>

          <h1 className="text-3xl font-bold">{event.title}</h1>

          <p className="mt-3 text-gray-300">{event.description}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
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
              {event.status}
            </span>

            <span className="rounded border border-gray-700 bg-black px-2 py-1 text-gray-300">
              {event.sourceCount} Sources
            </span>
          </div>

          <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded border border-gray-800 bg-black p-4">
              <p className="text-gray-500">Region</p>
              <p className="mt-1 text-white">{event.region}</p>
            </div>

            <div className="rounded border border-gray-800 bg-black p-4">
              <p className="text-gray-500">Country</p>
              <p className="mt-1 text-white">{event.country}</p>
            </div>

            <div className="rounded border border-gray-800 bg-black p-4">
              <p className="text-gray-500">Location</p>
              <p className="mt-1 text-white">{event.locationLabel}</p>
            </div>

            <div className="rounded border border-gray-800 bg-black p-4">
              <p className="text-gray-500">Event Time</p>
              <p className="mt-1 text-white">
                {new Date(event.eventTime).toUTCString()}
              </p>
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-lg border border-gray-800 bg-gray-950 p-6">
          <h2 className="text-xl font-semibold">Source Visibility</h2>

          {sources.length === 0 ? (
            <p className="mt-4 text-gray-400">No source records available.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {sources.map((source, index) => (
                <span
                  key={`${event.id}-source-${index}`}
                  className="rounded border border-gray-700 bg-black px-3 py-2 text-sm text-gray-300"
                >
                  {source}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-lg border border-gray-800 bg-gray-950 p-6">
          <h2 className="text-xl font-semibold">Timeline</h2>

          {timeline.length === 0 ? (
            <p className="mt-4 text-gray-400">No timeline entries available.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {timeline.map((item, index) => (
                <div
                  key={`${event.id}-timeline-${index}`}
                  className="rounded border border-gray-800 bg-black p-4 text-sm text-gray-300"
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}