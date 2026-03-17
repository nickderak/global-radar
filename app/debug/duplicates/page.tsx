import Link from "next/link";
import { getDuplicateEvents } from "../../lib/getDuplicateEvents";

export default async function DuplicateEventsPage() {
  const duplicates = await getDuplicateEvents();

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-gray-800 pb-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
            Global Squawk Box
          </p>
          <h1 className="text-4xl font-bold">Duplicate Event Cleanup</h1>
          <p className="mt-3 text-gray-300">
            Review duplicate events before deleting anything.
          </p>
        </header>

        {duplicates.length === 0 ? (
          <div className="rounded-lg border border-gray-800 bg-gray-950 p-6 text-gray-400">
            No duplicate events found.
          </div>
        ) : (
          <div className="space-y-6">
            {duplicates.map((group, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-800 bg-gray-950 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{group.title}</h2>
                    <p className="mt-2 text-sm text-gray-400">
                      Duplicate count: {group.duplicateCount}
                    </p>
                  </div>

                  <div className="rounded border border-red-700 bg-red-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-300">
                    Cleanup Needed
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-green-800 bg-green-950/30 p-4">
                  <h3 className="text-lg font-semibold text-green-300">Keep</h3>
                  <p className="mt-2 text-gray-200">{group.keep.title}</p>
                  <p className="mt-2 text-sm text-gray-400">
                    Slug: {group.keep.slug}
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Confidence: {group.keep.confidenceLabel} ({group.keep.confidenceScore})
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Sources: {group.keep.sourceCount}
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Created: {new Date(group.keep.createdAt).toUTCString()}
                  </p>

                  <Link
                    href={`/events/${group.keep.slug}`}
                    className="mt-4 inline-block rounded border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:border-gray-500"
                  >
                    Open Kept Event
                  </Link>
                </div>

                <div className="mt-6 rounded-lg border border-red-800 bg-red-950/20 p-4">
                  <h3 className="text-lg font-semibold text-red-300">Suggested Remove</h3>

                  <div className="mt-4 space-y-4">
                    {group.remove.map((event) => (
                      <div
                        key={event.id}
                        className="rounded border border-gray-800 bg-black p-4"
                      >
                        <p className="text-gray-200">{event.title}</p>
                        <p className="mt-2 text-sm text-gray-400">
                          Slug: {event.slug}
                        </p>
                        <p className="mt-2 text-sm text-gray-400">
                          Confidence: {event.confidenceLabel} ({event.confidenceScore})
                        </p>
                        <p className="mt-2 text-sm text-gray-400">
                          Sources: {event.sourceCount}
                        </p>
                        <p className="mt-2 text-sm text-gray-400">
                          Created: {new Date(event.createdAt).toUTCString()}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <Link
                            href={`/events/${event.slug}`}
                            className="rounded border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:border-gray-500"
                          >
                            Open Duplicate Event
                          </Link>

                          <Link
                            href={`/debug/delete-event/${event.id}`}
                            className="rounded border border-red-700 bg-red-950 px-3 py-2 text-sm text-red-300 hover:border-red-500"
                          >
                            Delete This Duplicate
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}