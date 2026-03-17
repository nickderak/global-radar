import { calculateImportance } from "../../lib/importance";

const testEvents = [
  {
    title: "Explosion reported near Red Sea shipping corridor",
    category: "Infrastructure",
    region: "Middle East",
    sourceCount: 3,
    status: "Confirmed",
  },
  {
    title: "Central bank emergency meeting announced",
    category: "Finance / Monetary",
    region: "Global",
    sourceCount: 3,
    status: "Confirmed",
  },
  {
    title: "Earthquake reported near Tokyo",
    category: "Natural Disasters",
    region: "Japan",
    sourceCount: 3,
    status: "Developing",
  },
];

export default function ImportanceDebugPage() {
  const results = testEvents.map((event) => ({
    ...event,
    ...calculateImportance({
      category: event.category,
      region: event.region,
      sourceCount: event.sourceCount,
      status: event.status,
    }),
  }));

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-gray-800 pb-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
            Global Radar
          </p>
          <h1 className="text-4xl font-bold">Importance Debug View</h1>
          <p className="mt-3 text-gray-300">
            Automatic importance scoring for test events.
          </p>
        </header>

        <div className="space-y-4">
          {results.map((event) => (
            <div
              key={event.title}
              className="rounded-lg border border-gray-800 bg-gray-950 p-5"
            >
              <h2 className="text-xl font-semibold">{event.title}</h2>

              <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-300">
                <span>Score: {event.importanceScore}</span>
                <span>Label: {event.importanceLabel}</span>
                <span>Category: {event.category}</span>
                <span>Region: {event.region}</span>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Reasoning
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-gray-300">
                  {event.importanceReasons.map((reason) => (
                    <li
                      key={reason}
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
      </div>
    </main>
  );
}