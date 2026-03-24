"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LiveAlertBanner from "./LiveAlertBanner";

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
  sourcesJson?: unknown;
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

function getEventCardClass(importanceLabel: string, isNew: boolean) {
  const normalized = importanceLabel.toLowerCase();
  const base = isNew
    ? "ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)]"
    : "";

  if (normalized.includes("global")) {
    return `border border-red-700 bg-red-950/20 ${base}`.trim();
  }

  if (normalized.includes("high")) {
    return `border border-purple-700 bg-purple-950/20 ${base}`.trim();
  }

  return `border border-gray-800 bg-gray-950 ${base}`.trim();
}

function getNewEventIds(
  currentEvents: EventFeedItem[],
  previousIds: string[]
): string[] {
  return currentEvents
    .filter((event) => !previousIds.includes(event.id))
    .map((event) => event.id);
}

function sortNewestFirst(events: EventFeedItem[]) {
  return [...events].sort((a, b) => {
    const timeDiff =
      new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime();

    if (timeDiff !== 0) return timeDiff;

    return b.importanceScore - a.importanceScore;
  });
}

export default function EventFeedClient({
  initialEvents,
}: {
  initialEvents: EventFeedItem[];
}) {
  const [events, setEvents] = useState<EventFeedItem[]>(
    sortNewestFirst(initialEvents)
  );
  const [newCount, setNewCount] = useState(0);
  const [newIds, setNewIds] = useState<string[]>([]);
  const previousIds = useRef<string[]>(initialEvents.map((e) => e.id));

  async function loadEvents() {
    const res = await fetch("/api/events", {
      cache: "no-store",
    });

    const data = (await res.json()) as EventFeedItem[];
    const sortedData = sortNewestFirst(data);
    const newEventIds = getNewEventIds(sortedData, previousIds.current);

    if (newEventIds.length > 0) {
      setNewCount(newEventIds.length);
      setNewIds(newEventIds);

      window.setTimeout(() => {
        setNewCount(0);
        setNewIds([]);
      }, 8000);
    }

    previousIds.current = sortedData.map((e) => e.id);
    setEvents(sortedData);
  }

  useEffect(() => {
    const interval = window.setInterval(loadEvents, 5000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      <LiveAlertBanner count={newCount} />

      <div className="mb-4 rounded border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-gray-300">
        Showing newest events first
      </div>

      <div className="space-y-4">
        {events.map((event) => {
          const sources = safeSources(event.sourcesJson);
          const isNew = newIds.includes(event.id);

          return (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className={`block rounded-lg p-5 transition hover:border-gray-600 ${getEventCardClass(
                event.importanceLabel,
                isNew
              )}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">{event.title}</h2>

                    {isNew && (
                      <span className="rounded border border-red-700 bg-red-950 px-2 py-1 text-xs text-red-300">
                        NEW
                      </span>
                    )}
                  </div>

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

              <p className="mt-4 text-sm text-gray-300">{event.description}</p>

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
    </>
  );
}