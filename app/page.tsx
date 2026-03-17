import Link from "next/link";
import { prisma } from "./lib/prisma";

const workflow = [
  {
    step: "01",
    title: "Ingest Signals",
    description:
      "The platform collects incoming signals from structured feeds and monitoring sources.",
  },
  {
    step: "02",
    title: "Cluster Events",
    description:
      "Signals are compared against existing events to reduce duplicates and group related activity.",
  },
  {
    step: "03",
    title: "Verify & Score",
    description:
      "Events are evaluated using source support, confidence logic, and importance escalation.",
  },
  {
    step: "04",
    title: "Surface Globally",
    description:
      "Verified events appear in the event feed, radar view, and structured event timelines.",
  },
];

function confidenceClass(v: string) {
  const c = v.toLowerCase();

  if (c === "high") return "bg-green-900 text-green-300 border-green-700";
  if (c === "medium") return "bg-yellow-900 text-yellow-300 border-yellow-700";

  return "bg-red-900 text-red-300 border-red-700";
}

function importanceClass(v: string) {
  const c = v.toLowerCase();

  if (c.includes("global"))
    return "bg-red-900 text-red-300 border-red-700";

  if (c.includes("high"))
    return "bg-purple-900 text-purple-300 border-purple-700";

  if (c.includes("medium"))
    return "bg-blue-900 text-blue-300 border-blue-700";

  return "bg-gray-900 text-gray-300 border-gray-700";
}

export default async function HomePage() {
  const latestEvents = await prisma.event.findMany({
    orderBy: { eventTime: "desc" },
    take: 3,
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <section className="text-center">
          <h1 className="text-6xl font-bold tracking-tight">
            Global Radar
          </h1>

          <p className="mt-6 text-xl text-gray-300">
            Real-time global event detection.
          </p>

          <p className="mx-auto mt-4 max-w-3xl text-gray-400">
            Global Radar detects, clusters, and surfaces major world
            events using multi-source signal ingestion, event matching,
            and live monitoring workflows.
          </p>

          <div className="mt-10 flex justify-center gap-6">
            <Link
              href="/events"
              className="rounded-lg bg-red-600 px-8 py-3 font-semibold hover:bg-red-700"
            >
              View Event Feed
            </Link>

            <Link
              href="/radar"
              className="rounded-lg border border-gray-700 px-8 py-3 hover:border-white"
            >
              Open Global Radar
            </Link>
          </div>
        </section>

        <section className="mt-24 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-8">
            <h3 className="text-xl font-semibold">Live Event Feed</h3>
            <p className="mt-3 text-gray-400">
              Browse events by region, category, confidence, importance, and
              operational status.
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-8">
            <h3 className="text-xl font-semibold">Global Radar</h3>
            <p className="mt-3 text-gray-400">
              Watch major world events accumulate visually through a live radar
              interface.
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-8">
            <h3 className="text-xl font-semibold">Source-Aware Events</h3>
            <p className="mt-3 text-gray-400">
              Each event tracks source support and timeline updates as new
              signals arrive.
            </p>
          </div>
        </section>

        <section className="mt-28">
          <div className="text-center">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              The platform is designed to behave more like an intelligence
              workflow than a traditional article list.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {workflow.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-gray-800 bg-gray-950 p-6"
              >
                <div className="text-xl font-bold text-red-400">{item.step}</div>
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-28">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Latest Events</h2>

            <Link
              href="/events"
              className="text-sm text-gray-400 underline hover:text-white"
            >
              Open full feed
            </Link>
          </div>

          {latestEvents.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-6 text-gray-400">
              No events available yet.
            </div>
          ) : (
            <div className="space-y-4">
              {latestEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="block rounded-xl border border-gray-800 bg-gray-950 p-6 hover:border-gray-600"
                >
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {event.region} · {event.category}
                      </p>
                    </div>

                    <div className="flex gap-2 text-xs">
                      <span
                        className={`border rounded px-2 py-1 ${confidenceClass(
                          event.confidenceLabel
                        )}`}
                      >
                        {event.confidenceLabel}
                      </span>

                      <span
                        className={`border rounded px-2 py-1 ${importanceClass(
                          event.importanceLabel
                        )}`}
                      >
                        {event.importanceLabel}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}