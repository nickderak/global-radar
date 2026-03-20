import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { notFound } from "next/navigation";
import { isWatchlistMatch } from "../../lib/watchlistFilter";

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

function getConfidenceBadgeClass(value: string) {
  const normalized = value.toLowerCase();

  if (normalized === "high") {
    return "border-green-700 bg-green-950 text-green-300";
  }

  if (normalized === "medium") {
    return "border-yellow-700 bg-yellow-950 text-yellow-300";
  }

  return "border-red-700 bg-red-950 text-red-300";
}

function getImportanceBadgeClass(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("global")) {
    return "border-red-700 bg-red-950 text-red-300";
  }

  if (normalized.includes("high")) {
    return "border-purple-700 bg-purple-950 text-purple-300";
  }

  if (normalized.includes("medium")) {
    return "border-blue-700 bg-blue-950 text-blue-300";
  }

  return "border-gray-700 bg-gray-950 text-gray-300";
}

function getStatusBadgeClass(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("active")) {
    return "border-blue-700 bg-blue-950 text-blue-300";
  }

  if (normalized.includes("monitor")) {
    return "border-yellow-700 bg-yellow-950 text-yellow-300";
  }

  if (normalized.includes("resolved")) {
    return "border-green-700 bg-green-950 text-green-300";
  }

  return "border-gray-700 bg-gray-950 text-gray-300";
}

function getScoreLabel(score: number) {
  if (score >= 90) return "Extreme";
  if (score >= 75) return "High";
  if (score >= 50) return "Moderate";
  return "Low";
}

function getSourceConfidenceSummary(sourceCount: number, confidenceLabel: string) {
  if (sourceCount >= 3 && confidenceLabel.toLowerCase() === "high") {
    return "Multi-source confirmed";
  }

  if (sourceCount >= 2) {
    return "Cross-source support present";
  }

  return "Single-source signal";
}

function getConfidenceExplanation(
  sourceCount: number,
  confidenceLabel: string,
  confidenceScore: number
) {
  const normalized = confidenceLabel.toLowerCase();

  if (normalized === "high") {
    if (sourceCount >= 3) {
      return `This event is rated High confidence because it has ${sourceCount} supporting sources and a confidence score of ${confidenceScore}. The system treats this as a strongly corroborated event.`;
    }

    return `This event is rated High confidence with a score of ${confidenceScore}. Even with fewer sources, the incoming signals were strong enough to elevate confidence.`;
  }

  if (normalized === "medium") {
    if (sourceCount >= 2) {
      return `This event is rated Medium confidence because there are ${sourceCount} supporting sources, but the overall signal strength remains short of a High confidence threshold.`;
    }

    return `This event is rated Medium confidence with a score of ${confidenceScore}. The system sees a meaningful signal, but not enough evidence yet for high-confidence confirmation.`;
  }

  return `This event is rated Low confidence because the current evidence is limited. With ${sourceCount} source${sourceCount === 1 ? "" : "s"} and a score of ${confidenceScore}, this remains an early or lightly supported signal.`;
}

function getImportanceExplanation(
  category: string,
  sourceCount: number,
  importanceLabel: string,
  importanceScore: number
) {
  const normalizedCategory = category.toLowerCase();
  const normalizedImportance = importanceLabel.toLowerCase();

  if (normalizedImportance.includes("global")) {
    return `This event is rated ${importanceLabel} with an importance score of ${importanceScore}. Its category (${category}) is considered inherently serious, and multi-source support has pushed it into the highest priority tier.`;
  }

  if (normalizedImportance.includes("high")) {
    return `This event is rated ${importanceLabel} with a score of ${importanceScore}. The combination of event type (${category}) and ${sourceCount} supporting source${sourceCount === 1 ? "" : "s"} makes it important enough to surface near the top of the feed.`;
  }

  if (normalizedImportance.includes("medium")) {
    if (normalizedCategory === "weather" || normalizedCategory === "infrastructure") {
      return `This event is rated ${importanceLabel} with a score of ${importanceScore}. It is relevant and worth monitoring, but the current event type and source support do not yet justify high-priority escalation.`;
    }

    return `This event is rated ${importanceLabel} with a score of ${importanceScore}. It has operational relevance, but its current severity and confirmation level keep it below the highest priority tier.`;
  }

  return `This event is rated ${importanceLabel} with a score of ${importanceScore}. The system currently treats it as lower urgency relative to other live events in the feed.`;
}

function getAnalystSummary(
  category: string,
  confidenceLabel: string,
  importanceLabel: string,
  sourceCount: number,
  region: string
) {
  return `This ${category.toLowerCase()} event is currently assessed as ${confidenceLabel.toLowerCase()} confidence and ${importanceLabel.toLowerCase()}. It is being tracked in ${region} with ${sourceCount} supporting source${sourceCount === 1 ? "" : "s"}, indicating ${sourceCount >= 2 ? "cross-source confirmation" : "an early-stage signal"} at this stage.`;
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
  });

  if (!event) {
    notFound();
  }

  const timeline = safeStringArray(event.timelineJson);
  const sources = safeStringArray(event.sourcesJson);

  const sourceSummary = getSourceConfidenceSummary(
    event.sourceCount,
    event.confidenceLabel
  );

  const confidenceExplanation = getConfidenceExplanation(
    event.sourceCount,
    event.confidenceLabel,
    event.confidenceScore
  );

  const importanceExplanation = getImportanceExplanation(
    event.category,
    event.sourceCount,
    event.importanceLabel,
    event.importanceScore
  );

  const analystSummary = getAnalystSummary(
    event.category,
    event.confidenceLabel,
    event.importanceLabel,
    event.sourceCount,
    event.region
  );

  const watchlistMatch = isWatchlistMatch({
    region: event.region,
    category: event.category,
    importanceScore: event.importanceScore,
  });

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
            href="/radar"
            className="text-sm text-gray-400 underline hover:text-white"
          >
            Back to Radar
          </Link>
        </div>

        <header className="rounded-xl border border-gray-800 bg-gray-950 p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
            GLOBAL RADAR
          </p>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <p className="mt-3 text-gray-300">{event.description}</p>
            </div>

            <div className="min-w-[220px] rounded-lg border border-gray-800 bg-black p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Event Snapshot
              </p>
              <div className="mt-3 grid gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Time</p>
                  <p className="mt-1 text-white">
                    {new Date(event.eventTime).toUTCString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Sources</p>
                  <p className="mt-1 text-white">{event.sourceCount}</p>
                </div>
                <div>
                  <p className="text-gray-500">Credibility</p>
                  <p className="mt-1 text-white">{event.confidenceScore}</p>
                </div>
                <div>
                  <p className="text-gray-500">Importance</p>
                  <p className="mt-1 text-white">{event.importanceScore}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span
              className={`rounded border px-2 py-1 ${getConfidenceBadgeClass(
                event.confidenceLabel
              )}`}
            >
              {event.confidenceLabel} Confidence
            </span>

            <span
              className={`rounded border px-2 py-1 ${getImportanceBadgeClass(
                event.importanceLabel
              )}`}
            >
              {event.importanceLabel}
            </span>

            <span
              className={`rounded border px-2 py-1 ${getStatusBadgeClass(
                event.status
              )}`}
            >
              {event.status}
            </span>

            <span className="rounded border border-gray-700 bg-black px-2 py-1 text-gray-300">
              {event.category}
            </span>

            {watchlistMatch && (
              <span className="rounded border border-red-700 bg-red-950 px-2 py-1 text-red-300">
                Watchlist Match
              </span>
            )}
          </div>
        </header>

        <section className="mt-6 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Analyst Summary</h2>
              <p className="mt-1 text-sm text-gray-500">
                Quick interpretation of the event’s current classification.
              </p>
            </div>

            <span className="rounded border border-gray-700 bg-black px-3 py-2 text-sm text-gray-300">
              {getScoreLabel(event.importanceScore)} Heat
            </span>
          </div>

          <div className="mt-4 rounded border border-gray-800 bg-black p-4">
            <p className="text-sm text-gray-300">{analystSummary}</p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6 lg:col-span-1">
            <h2 className="text-lg font-semibold">Source Confidence</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="rounded border border-gray-800 bg-black p-4">
                <p className="text-gray-500">Assessment</p>
                <p className="mt-1 text-white">{sourceSummary}</p>
              </div>

              <div className="rounded border border-gray-800 bg-black p-4">
                <p className="text-gray-500">Confidence Label</p>
                <p className="mt-1 text-white">{event.confidenceLabel}</p>
              </div>

              <div className="rounded border border-gray-800 bg-black p-4">
                <p className="text-gray-500">Confidence Score</p>
                <p className="mt-1 text-white">{event.confidenceScore}</p>
              </div>

              <div className="rounded border border-gray-800 bg-black p-4">
                <p className="text-gray-500">Source Count</p>
                <p className="mt-1 text-white">{event.sourceCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6 lg:col-span-1">
            <h2 className="text-lg font-semibold">Geography</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="rounded border border-gray-800 bg-black p-4">
                <p className="text-gray-500">Region</p>
                <p className="mt-1 text-white">{event.region}</p>
              </div>

              <div className="rounded border border-gray-800 bg-black p-4">
                <p className="text-gray-500">Country</p>
                <p className="mt-1 text-white">{event.country}</p>
              </div>

              <div className="rounded border border-gray-800 bg-black p-4">
                <p className="text-gray-500">Location Label</p>
                <p className="mt-1 text-white">{event.locationLabel}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6 lg:col-span-1">
            <h2 className="text-lg font-semibold">Assessment</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="rounded border border-gray-800 bg-black p-4">
                <p className="text-gray-500">Confidence Score</p>
                <p className="mt-1 text-white">{event.confidenceScore}</p>
              </div>

              <div className="rounded border border-gray-800 bg-black p-4">
                <p className="text-gray-500">Importance Score</p>
                <p className="mt-1 text-white">{event.importanceScore}</p>
              </div>

              <div className="rounded border border-gray-800 bg-black p-4">
                <p className="text-gray-500">Heat Level</p>
                <p className="mt-1 text-white">
                  {getScoreLabel(event.importanceScore)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6 lg:col-span-1">
            <h2 className="text-lg font-semibold">Operational Status</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="rounded border border-gray-800 bg-black p-4">
                <p className="text-gray-500">Status</p>
                <p className="mt-1 text-white">{event.status}</p>
              </div>

              <div className="rounded border border-gray-800 bg-black p-4">
                <p className="text-gray-500">Category</p>
                <p className="mt-1 text-white">{event.category}</p>
              </div>

              <div className="rounded border border-gray-800 bg-black p-4">
                <p className="text-gray-500">Source Count</p>
                <p className="mt-1 text-white">{event.sourceCount}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Confidence Explanation</h2>
              <p className="mt-1 text-sm text-gray-500">
                Why the system assigned this confidence level.
              </p>
            </div>

            <span
              className={`rounded border px-3 py-2 text-sm ${getConfidenceBadgeClass(
                event.confidenceLabel
              )}`}
            >
              {event.confidenceLabel} Confidence
            </span>
          </div>

          <div className="mt-4 rounded border border-gray-800 bg-black p-4">
            <p className="text-sm text-gray-300">{confidenceExplanation}</p>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Importance Explanation</h2>
              <p className="mt-1 text-sm text-gray-500">
                Why this event is ranked at its current priority level.
              </p>
            </div>

            <span
              className={`rounded border px-3 py-2 text-sm ${getImportanceBadgeClass(
                event.importanceLabel
              )}`}
            >
              {event.importanceLabel}
            </span>
          </div>

          <div className="mt-4 rounded border border-gray-800 bg-black p-4">
            <p className="text-sm text-gray-300">{importanceExplanation}</p>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Source Breakdown</h2>
              <p className="mt-1 text-sm text-gray-500">
                Individual source records currently attached to this event.
              </p>
            </div>

            <div className="rounded border border-gray-800 bg-black px-4 py-2 text-sm text-gray-300">
              {sources.length} source{sources.length === 1 ? "" : "s"}
            </div>
          </div>

          {sources.length === 0 ? (
            <p className="mt-4 text-gray-400">No source records available.</p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {sources.map((source, index) => (
                <div
                  key={`${event.id}-source-${index}`}
                  className="rounded border border-gray-800 bg-black p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Source {index + 1}
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {source}
                      </p>
                    </div>

                    <span className="rounded border border-gray-700 bg-gray-950 px-2 py-1 text-xs text-gray-300">
                      Confirming
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Event Timeline</h2>
            <p className="text-sm text-gray-500">
              Structured event progression and source updates.
            </p>
          </div>

          {timeline.length === 0 ? (
            <p className="mt-4 text-gray-400">No timeline entries available.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {timeline.map((item, index) => (
                <div
                  key={`${event.id}-timeline-${index}`}
                  className="rounded border border-gray-800 bg-black p-4"
                >
                  <div className="flex gap-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-red-400" />
                    <p className="text-sm text-gray-300">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}