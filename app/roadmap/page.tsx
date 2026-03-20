import Link from "next/link";

const roadmapItems = [
  {
    phase: "Phase 1",
    title: "Core Intelligence Platform",
    status: "Complete",
    items: [
      "Live event feed",
      "Radar map",
      "Event detail pages",
      "Multi-source ingestion",
      "Confidence and importance scoring",
    ],
  },
  {
    phase: "Phase 2",
    title: "Watchlist and Monitoring",
    status: "Complete",
    items: [
      "Watchlist matching",
      "Watchlist alerts section",
      "Radar watchlist summary",
      "Settings page for watchlist visibility",
    ],
  },
  {
    phase: "Phase 3",
    title: "Operator Workflow",
    status: "Next",
    items: [
      "Real alert notifications",
      "Improved review queue",
      "Analyst workflow tools",
      "Faster event triage",
    ],
  },
  {
    phase: "Phase 4",
    title: "Product Expansion",
    status: "Planned",
    items: [
      "User accounts",
      "Saved watchlists",
      "Email / SMS alerts",
      "More external feeds",
      "Public launch readiness",
    ],
  },
];

function getStatusClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "complete") {
    return "border-green-700 bg-green-950 text-green-300";
  }

  if (normalized === "next") {
    return "border-yellow-700 bg-yellow-950 text-yellow-300";
  }

  return "border-gray-700 bg-gray-950 text-gray-300";
}

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/events"
            className="text-sm text-gray-400 underline hover:text-white"
          >
            Back to Event Feed
          </Link>

          <Link
            href="/settings"
            className="text-sm text-gray-400 underline hover:text-white"
          >
            Back to Settings
          </Link>
        </div>

        <header className="mb-8 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
            GLOBAL RADAR
          </p>
          <h1 className="text-3xl font-bold">Product Roadmap</h1>
          <p className="mt-3 max-w-3xl text-gray-300">
            Current build progress and the next stages of platform development.
          </p>
        </header>

        <div className="space-y-6">
          {roadmapItems.map((item) => (
            <section
              key={item.phase}
              className="rounded-xl border border-gray-800 bg-gray-950 p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">
                    {item.phase}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{item.title}</h2>
                </div>

                <span
                  className={`rounded border px-3 py-2 text-sm ${getStatusClass(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {item.items.map((subItem) => (
                  <div
                    key={subItem}
                    className="rounded border border-gray-800 bg-black p-4 text-sm text-gray-300"
                  >
                    {subItem}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}