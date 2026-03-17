import Link from "next/link";
import { forceCreateEvent } from "../../../lib/reviewActions";

export default async function ReviewCreatePage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;

  const outcome = await forceCreateEvent(reportId);

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Force New Event</h1>

        <div className="mt-8 rounded-lg border border-gray-800 bg-gray-950 p-5">
          <p className="text-green-300">Review-forced event creation completed.</p>
          <p className="mt-2 text-gray-300">Event: {outcome.event.title}</p>
          <p className="mt-2 text-gray-400">Slug: {outcome.event.slug}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/events/${outcome.event.slug}`}
              className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500"
            >
              Open Created Event
            </Link>

            <Link
              href="/review"
              className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500"
            >
              Back to Review Queue
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}