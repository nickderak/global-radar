import { compareReportsToEvents } from "../../lib/clustering";

function getDecisionClass(decision: string) {
  switch (decision) {
    case "Merge":
      return "border-green-700 bg-green-950 text-green-300";
    case "Review":
      return "border-yellow-700 bg-yellow-950 text-yellow-300";
    case "New Event":
      return "border-blue-700 bg-blue-950 text-blue-300";
    default:
      return "border-gray-700 bg-gray-950 text-gray-300";
  }
}

export default function ClusteringDebugPage() {
  const results = compareReportsToEvents();

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-gray-800 pb-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
            Global Squawk Box
          </p>
          <h1 className="text-4xl font-bold">Clustering Debug View</h1>
          <p className="mt-3 text-gray-300">
            Compare incoming reports against existing events.
          </p>
        </header>

        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result.report}
              className="rounded-lg border border-gray-800 bg-gray-950 p-5"
            >
              <h2 className="text-xl font-semibold text-white">
                Incoming Report
              </h2>
              <p className="mt-2 text-gray-300">{result.report}</p>

              <div className="mt-4 border-t border-gray-800 pt-4">
                <h3 className="text-lg font-semibold text-white">Best Match</h3>
                <p className="mt-2 text-gray-300">
                  {result.bestMatch?.eventTitle ?? "No match found"}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Score: {result.bestMatch?.score ?? 0}
                </p>

                <div className="mt-3">
                  <span
                    className={`rounded border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getDecisionClass(
                      result.decision
                    )}`}
                  >
                    {result.decision}
                  </span>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                    Match Reasoning
                  </h4>
                  <ul className="mt-2 space-y-2 text-sm text-gray-300">
                    {result.bestMatch?.reasons?.map((reason) => (
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
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}