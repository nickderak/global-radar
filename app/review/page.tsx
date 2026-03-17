import Link from "next/link";
import { getReviewQueue } from "../lib/getReviewQueue";

export default async function ReviewQueuePage() {
  const reviewItems = await getReviewQueue();

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-gray-800 pb-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
            Global Squawk Box
          </p>
          <h1 className="text-4xl font-bold">Review Queue</h1>
          <p className="mt-3 text-gray-300">
            Incoming reports with uncertain match scores that need analyst review.
          </p>
        </header>

        {reviewItems.length === 0 ? (
          <div className="rounded-lg border border-gray-800 bg-gray-950 p-6 text-gray-400">
            No review items found.
          </div>
        ) : (
          <div className="space-y-6">
            {reviewItems.map((item) => (
              <div
                key={item.reportId}
                className="rounded-lg border border-gray-800 bg-gray-950 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{item.reportTitle}</h2>
                    <p className="mt-2 text-sm text-gray-400">
                      Source: {item.reportSource}
                    </p>
                  </div>

                  <div className="rounded border border-yellow-700 bg-yellow-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-300">
                    Review
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-300">
                  Match score: {item.score}
                </div>

                <div className="mt-6 rounded-lg border border-gray-800 bg-black p-4">
                  <h3 className="text-lg font-semibold">Candidate Event</h3>

                  {item.candidateEvent ? (
                    <>
                      <p className="mt-2 text-gray-300">
                        {item.candidateEvent.title}
                      </p>
                      <p className="mt-2 text-sm text-gray-400">
                        {item.candidateEvent.region} · {item.candidateEvent.category}
                      </p>

                      <Link
                        href={`/events/${item.candidateEvent.slug}`}
                        className="mt-4 inline-block rounded border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:border-gray-500"
                      >
                        Open Candidate Event
                      </Link>
                    </>
                  ) : (
                    <p className="mt-2 text-gray-400">No candidate event found.</p>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                    Match Reasons
                  </h3>

                  <ul className="mt-2 space-y-2 text-sm text-gray-300">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}