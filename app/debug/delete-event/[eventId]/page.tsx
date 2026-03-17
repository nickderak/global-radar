import Link from "next/link";
import { deleteEventById } from "../../../lib/deleteEventById";

export default async function DeleteEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const outcome: any = await deleteEventById(eventId);

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 border-b border-gray-800 pb-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
            Global Squawk Box
          </p>
          <h1 className="text-4xl font-bold">Delete Duplicate Event</h1>
          <p className="mt-3 text-gray-300">
            Safe single-event deletion for duplicate cleanup.
          </p>
        </header>

        <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
          {outcome.deleted ? (
            <>
              <p className="text-green-300">Event deleted successfully.</p>
              <p className="mt-4 text-gray-200">{outcome.event.title}</p>
              <p className="mt-2 text-sm text-gray-400">
                Slug: {outcome.event.slug}
              </p>
            </>
          ) : (
            <>
              <p className="text-yellow-300">{outcome.reason}</p>
            </>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/debug/duplicates"
              className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500"
            >
              Back to Duplicate Cleanup
            </Link>

            <Link
              href="/events"
              className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500"
            >
              View Events
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}