import Link from "next/link";
import { watchlistConfig } from "../lib/watchlistConfig";

export default function SettingsPage() {
  const regionCount = watchlistConfig.regions.length;
  const categoryCount = watchlistConfig.categories.length;

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/events"
            className="text-sm text-gray-400 underline hover:text-white"
          >
            Back to Event Feed
          </Link>

          <Link
            href="/radar"
            className="text-sm text-gray-400 underline hover:text-white"
          >
            Back to Radar
          </Link>
        </div>

        <header className="mb-8 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
                GLOBAL RADAR
              </p>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="mt-3 text-gray-300">
                Current watchlist configuration and platform monitoring rules.
              </p>
            </div>

            <div className="rounded-lg border border-red-800 bg-red-950/20 p-4">
              <p className="text-xs uppercase tracking-wide text-red-400">
                Watchlist Summary
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-white">
                  {regionCount} region{regionCount === 1 ? "" : "s"}
                </p>
                <p className="text-white">
                  {categoryCount} categor{categoryCount === 1 ? "y" : "ies"}
                </p>
                <p className="text-white">
                  Minimum score: {watchlistConfig.minimumImportanceScore}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* QUICK NAVIGATION (UPDATED WITH ROADMAP) */}
        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <Link
            href="/events"
            className="rounded-xl border border-gray-800 bg-gray-950 p-5 transition hover:border-gray-600"
          >
            <h2 className="text-lg font-semibold">Event Feed</h2>
            <p className="mt-2 text-sm text-gray-400">
              Review all live events and alerts.
            </p>
          </Link>

          <Link
            href="/radar"
            className="rounded-xl border border-gray-800 bg-gray-950 p-5 transition hover:border-gray-600"
          >
            <h2 className="text-lg font-semibold">Radar</h2>
            <p className="mt-2 text-sm text-gray-400">
              View events on the global map.
            </p>
          </Link>

          <Link
            href="/roadmap"
            className="rounded-xl border border-gray-800 bg-gray-950 p-5 transition hover:border-gray-600"
          >
            <h2 className="text-lg font-semibold">Product Roadmap</h2>
            <p className="mt-2 text-sm text-gray-400">
              See platform progress and upcoming features.
            </p>
          </Link>

          <Link
            href="/debug/ingest"
            className="rounded-xl border border-gray-800 bg-gray-950 p-5 transition hover:border-gray-600"
          >
            <h2 className="text-lg font-semibold">Ingestion</h2>
            <p className="mt-2 text-sm text-gray-400">
              Monitor data ingestion and feeds.
            </p>
          </Link>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
            <h2 className="text-lg font-semibold">Watchlist Regions</h2>

            {watchlistConfig.regions.length === 0 ? (
              <p className="mt-4 text-sm text-gray-400">
                No regions configured.
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {watchlistConfig.regions.map((region) => (
                  <span
                    key={region}
                    className="rounded border border-gray-700 bg-black px-3 py-2 text-sm text-gray-300"
                  >
                    {region}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
            <h2 className="text-lg font-semibold">Watchlist Categories</h2>

            {watchlistConfig.categories.length === 0 ? (
              <p className="mt-4 text-sm text-gray-400">
                No categories configured.
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {watchlistConfig.categories.map((category) => (
                  <span
                    key={category}
                    className="rounded border border-gray-700 bg-black px-3 py-2 text-sm text-gray-300"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
            <h2 className="text-lg font-semibold">Priority Threshold</h2>

            <div className="mt-4 rounded border border-gray-800 bg-black p-4">
              <p className="text-sm text-gray-500">Minimum Importance Score</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {watchlistConfig.minimumImportanceScore}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <h2 className="text-xl font-semibold">Quick Edit Instructions</h2>

          <div className="mt-4 space-y-4 text-sm text-gray-300">
            <div className="rounded border border-gray-800 bg-black p-4">
              <p className="font-medium text-white">File to Edit</p>
              <p className="mt-2">
                app/lib/watchlistConfig.ts
              </p>
            </div>

            <div className="rounded border border-gray-800 bg-black p-4">
              <p className="font-medium text-white">What to Change</p>
              <p className="mt-2">
                Update regions, categories, or importance score.
              </p>
            </div>

            <div className="rounded border border-gray-800 bg-black p-4">
              <p className="font-medium text-white">After Editing</p>
              <p className="mt-2">
                Save → git add . → git commit → git push
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}