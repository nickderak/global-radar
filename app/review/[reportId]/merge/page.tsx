import Link from "next/link";
import { approveMerge } from "../../../lib/reviewActions";

export default async function ReviewMergePage({
  params,
  searchParams,
}: {
  params: Promise<{ reportId: string }>;
  searchParams: Promise<{ eventId?: string }>;
}) {
  const { reportId } = await params;
  const { eventId } = await searchParams;

  if (!eventId) {
    return (
      <main className="min-h-screen bg-black px-8 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold">Approve Merge</h1>
          <p className="mt-4 text-red-300">Missing eventId.</p>
          <Link
            href="/review"
            className="mt-6 inline-block rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500"
          >
            Back to Review Queue
          </Link>
        </div>
      </main>
    );
  }

  const outcome = await approveMerge(reportId, eventId);

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Approve Merge</h1>

        <div className="mt-8 rounded-lg border border-gray-800 bg-gray-950 p-5">
          <p className="text-green-300">Review-approved merge completed.</p>
          <p className="mt-2 text-gray-300">Event: {outcome.event.title}</p>
          <p className="mt-2 text-gray-400">
            Confidence: {outcome.event.confidenceLabel} ({outcome.event.confidenceScore})
          </p>
          <p className="mt-2 text-gray-400">
            Source count: {outcome.event.sourceCount}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/events/${outcome.event.slug}`}
              className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500"
            >
              Open Updated Event
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