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
  const { eventId = "" } = await searchParams;

  if (!eventId) {
    return (
      <main className="min-h-screen bg-black px-8 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-red-400">Missing eventId.</p>
          <div className="mt-4">
            <Link href="/review" className="underline text-gray-300">
              Back to Review Queue
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const result = await approveMerge(reportId, eventId);

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-lg border border-gray-800 bg-gray-950 p-6">
        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
          GLOBAL RADAR
        </p>
        <h1 className="text-3xl font-bold">Merge Completed</h1>

        <div className="mt-6 rounded border border-gray-800 bg-black p-4 text-sm text-gray-300">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>

        <div className="mt-6 flex gap-4">
          <Link href="/review" className="underline text-gray-300">
            Back to Review Queue
          </Link>
          <Link href="/events" className="underline text-gray-300">
            Open Events
          </Link>
        </div>
      </div>
    </main>
  );
}