import { prisma } from "../lib/prisma";
import AutoRefresh from "../components/AutoRefresh";
import EventFeedClient from "../components/EventFeedClient";

type EventFeedItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  eventTime: string;
  region: string;
  category: string;
  confidenceLabel: string;
  importanceLabel: string;
  importanceScore: number;
  status: string;
  sourceCount: number;
  sourcesJson: unknown;
};

export default async function EventsPage() {
  const allEventsRaw = await prisma.event.findMany({
    orderBy: [{ importanceScore: "desc" }, { eventTime: "desc" }],
  });

  const events: EventFeedItem[] = allEventsRaw.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    eventTime: new Date(event.eventTime).toISOString(),
    region: event.region,
    category: event.category,
    confidenceLabel: event.confidenceLabel,
    importanceLabel: event.importanceLabel,
    importanceScore: event.importanceScore,
    status: event.status,
    sourceCount: event.sourceCount,
    sourcesJson: event.sourcesJson,
  }));

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
            Live global event intelligence feed with real-time alerting.
          </p>
        </header>

        <EventFeedClient initialEvents={events} />
      </div>
    </main>
  );
}