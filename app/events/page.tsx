"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { detectNewEvents } from "../lib/detectNewEvents";
import LiveAlertBanner from "../components/LiveAlertBanner";

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
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventFeedItem[]>([]);
  const [newCount, setNewCount] = useState(0);
  const previousIds = useRef<string[]>([]);

  async function loadEvents() {
    const res = await fetch("/api/events");
    const data = await res.json();

    const result = detectNewEvents(data, previousIds.current);

    if (result.newEventCount > 0) {
      setNewCount(result.newEventCount);
    }

    previousIds.current = data.map((e: EventFeedItem) => e.id);
    setEvents(data);
  }

  useEffect(() => {
    loadEvents();

    const interval = setInterval(loadEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <LiveAlertBanner count={newCount} />

      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold">Event Feed</h1>

        <div className="space-y-4">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="block rounded border border-gray-800 bg-gray-950 p-4 hover:border-gray-600"
            >
              <h2 className="font-semibold">{event.title}</h2>
              <p className="text-sm text-gray-400">
                {event.region} · {event.category}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}