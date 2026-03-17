import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { getReviewQueue } from "../../lib/getReviewQueue";

export default async function ReviewActionPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;

  const queue = await getReviewQueue();
  const item = queue.find((entry) => entry.reportId === reportId);

  if (!item) {
    return (
      <main className="min-h-screen bg-black px-8 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold">Review Item Not Found</h1>
          <p className="mt-4 text-gray-400">
            No review item was found for this report.
          </p>
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

  const fullReport = await prisma.incomingReport.findUnique({
    where: { id: item.reportId },
  });

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-gray-800 pb-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
            Global Squawk Box
          </p>
          <h1 className="text-4xl font-bold">Review Action</h1>
          <p className="mt-3 text-gray-300">
            Inspect this uncertain match and choose the next action.
          </p>
        </header>

        <div className="space-y-6">
          <div className="rounded-lg border border-gray-800 bg-gray-950 p-5">
            <h2 className="text-xl font-semibold">Incoming Report</h2>
            <p className="mt-2 text-gray-300">{item.reportTitle}</p>
            <p className="mt-2 text-sm text-gray-400">
              Source: {item.reportSource}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Match score: {item.score}
            </p>
            {fullReport?.description && (
              <p className="mt-4 text-sm text-gray-300">{fullReport.description}</p>
            )}
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-950 p-5">
            <h2 className="text-xl font-semibold">Candidate Event</h2>

            {item.candidateEvent ? (
              <>
                <p className="mt-2 text-gray-300">{item.candidateEvent.title}</p>
                <p className="mt-2 text-sm text-gray-400">
                  {item.candidateEvent.region} · {item.candidateEvent.category}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/events/${item.candidateEvent.slug}`}
                    className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500"
                  >
                    Open Candidate Event
                  </Link>

                  <Link
                    href={`/review/${item.reportId}/merge?eventId=${item.candidateEvent.id}`}
                    className="rounded border border-green-700 bg-green-950 px-4 py-2 text-sm text-green-300 hover:border-green-500"
                  >
                    Approve Merge
                  </Link>

                  <Link
                    href={`/review/${item.reportId}/create`}
                    className="rounded border border-blue-700 bg-blue-950 px-4 py-2 text-sm text-blue-300 hover:border-blue-500"
                  >
                    Force New Event
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-gray-400">No candidate event found.</p>

                <div className="mt-4">
                  <Link
                    href={`/review/${item.reportId}/create`}
                    className="rounded border border-blue-700 bg-blue-950 px-4 py-2 text-sm text-blue-300 hover:border-blue-500"
                  >
                    Force New Event
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-950 p-5">
            <h2 className="text-xl font-semibold">Match Reasons</h2>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              {item.reasons.map((reason, index) => (
                <li
                  key={index}
                  className="rounded border border-gray-800 bg-black p-3"
                >
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Link
              href="/review"
              className="inline-block rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500"
            >
              Back to Review Queue
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}