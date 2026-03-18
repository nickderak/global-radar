import Link from "next/link";

export default function LiveClusteringDebugPage() {
  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-gray-800 pb-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
            GLOBAL RADAR
          </p>
          <h1 className="text-4xl font-bold">Live Clustering Debug</h1>
          <p className="mt-3 text-gray-300">
            This debug page is temporarily simplified to unblock production deployment.
          </p>
        </header>

        <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
          <p className="text-gray-300">
            Live clustering diagnostics are temporarily disabled in production
            while deployment issues are being resolved.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/debug/ingest"
              className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500"
            >
              Open Ingestion Debug
            </Link>

            <Link
              href="/events"
              className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500"
            >
              View Events
            </Link>

            <Link
              href="/radar"
              className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-500"
            >
              Open Radar
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}