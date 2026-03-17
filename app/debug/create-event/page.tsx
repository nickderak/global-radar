import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function CreateEventDebugPage() {
  const report = await prisma.incomingReport.findFirst({
    orderBy: {
      timestamp: "desc",
    },
  });

  if (!report) {
    return (
      <main className="min-h-screen bg-black px-8 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold">Create Event From Incoming Report</h1>
          <p className="mt-4 text-gray-400">No IncomingReports found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-gray-800 pb-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
            Global Squawk Box
          </p>
          <h1 className="text-4xl font-bold">Create Event From Incoming Report</h1>
          <p className="mt-3 text-gray-300">
            Debug console for testing event creation logic.
          </p>
        </header>

        <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
          <h2 className="text-xl font-semibold">Latest Incoming Report</h2>

          <p className="mt-4 text-lg text-gray-200">{report.title}</p>

          <p className="mt-2 text-sm text-gray-400">
            Source: {report.source} • Type: {report.sourceType}
          </p>

          <p className="mt-4 text-sm text-gray-300">
            {report.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">

            <Link
              href={`/review/${report.id}`}
              className="rounded border border-yellow-700 bg-yellow-950 px-4 py-2 text-sm text-yellow-300 hover:border-yellow-500"
            >
              Open Review Decision
            </Link>

            <Link
              href={`/review/${report.id}/create`}
              className="rounded border border-blue-700 bg-blue-950 px-4 py-2 text-sm text-blue-300 hover:border-blue-500"
            >
              Force Create Event
            </Link>

            <Link
              href="/review"
              className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500"
            >
              Open Review Queue
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