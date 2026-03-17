import Link from "next/link";
import RadarMap from "./RadarMap";
import { prisma } from "../lib/prisma";
import AutoRefresh from "../components/AutoRefresh";

type RadarEvent = {
  id: string;
  slug: string;
  title: string;
  position: [number, number];
  region: string;
  category: string;
  confidenceLabel: string;
  importanceLabel: string;
  importanceScore: number;
  sourceCount: number;
  eventTime: string;
  sources: string[];
};

function safeSources(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

function getEventCoordinates(region: string, country: string): [number, number] {
  const normalizedRegion = region.toLowerCase();
  const normalizedCountry = country.toLowerCase();

  if (normalizedCountry === "japan") return [35.6762, 139.6503];
  if (normalizedCountry === "yemen") return [15.3694, 44.191];
  if (normalizedCountry === "united states") return [38.9072, -77.0369];
  if (normalizedCountry === "ukraine") return [50.4501, 30.5234];
  if (normalizedCountry === "russia") return [55.7558, 37.6173];
  if (normalizedCountry === "china") return [39.9042, 116.4074];
  if (normalizedCountry === "taiwan") return [25.033, 121.5654];
  if (normalizedCountry === "israel") return [31.7683, 35.2137];
  if (normalizedCountry === "brazil") return [-23.5505, -46.6333];
  if (normalizedCountry === "chile") return [-33.4489, -70.6693];
  if (normalizedCountry === "singapore") return [1.2903, 103.8519];

  if (normalizedRegion === "middle east") return [25.276987, 55.296249];
  if (normalizedRegion === "japan") return [35.6762, 139.6503];
  if (normalizedRegion === "europe") return [50.1109, 8.6821];
  if (normalizedRegion === "global") return [20, 0];
  if (normalizedRegion === "asia-pacific") return [1.3521, 103.8198];
  if (normalizedRegion === "east asia") return [37.5665, 126.978];
  if (normalizedRegion === "north america") return [38.9072, -77.0369];
  if (normalizedRegion === "south america") return [-23.5505, -46.6333];

  return [20, 0];
}

function getBadgeClass(value: string, type: "confidence" | "importance") {
  const normalized = value.toLowerCase();

  if (type === "confidence") {
    if (normalized === "high") return "border-green-700 bg-green-950 text-green-300";
    if (normalized === "medium") return "border-yellow-700 bg-yellow-950 text-yellow-300";
    return "border-red-700 bg-red-950 text-red-300";
  }

  if (normalized.includes("global")) return "border-red-700 bg-red-950 text-red-300";
  if (normalized.includes("high")) return "border-purple-700 bg-purple-950 text-purple-300";
  if (normalized.includes("medium")) return "border-blue-700 bg-blue-950 text-blue-300";
  return "border-gray-700 bg-gray-950 text-gray-300";
}

function getHeatLabel(score: number) {
  if (score >= 90) return "Extreme";
  if (score >= 75) return "High";
  if (score >= 50) return "Moderate";
  return "Low";
}

export default async function RadarPage() {
  const events = await prisma.event.findMany({
    orderBy: {
      importanceScore: "desc",
    },
  });

  const radarEvents: RadarEvent[] = events.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    position: getEventCoordinates(event.region, event.country),
    region: event.region,
    category: event.category,
    confidenceLabel: event.confidenceLabel,
    importanceLabel: event.importanceLabel,
    importanceScore: event.importanceScore,
    sourceCount: event.sourceCount,
    eventTime: new Date(event.eventTime).toISOString(),
    sources: safeSources(event.sourcesJson),
  }));

  return (
    <main className="min-h-screen bg-black text-white">
      <AutoRefresh intervalMs={5000} />

      <div className="mx-auto max-w-7xl">
        <div className="p-6">
          <h1 className="text-3xl font-bold">Global Event Radar</h1>
          <p className="mt-2 text-gray-400">
            Live database-backed event map with visible source support.
          </p>
        </div>

        <div className="px-6 pb-6">
          <div className="overflow-hidden rounded-lg border border-gray-800">
            <RadarMap events={radarEvents} />
          </div>
        </div>

        <div className="grid gap-6 px-6 pb-10 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-semibold">Mapped Events</h2>

            {radarEvents.length === 0 ? (
              <p className="text-gray-400">No events found in database.</p>
            ) : (
              <div className="space-y-4">
                {radarEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className="block rounded-lg border border-gray-800 bg-gray-950 p-4 transition hover:border-gray-600"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <p className="mt-2 text-sm text-gray-400">
                          {event.region} · {event.category}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          {new Date(event.eventTime).toUTCString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <span
                          className={`rounded border px-2 py-1 ${getBadgeClass(
                            event.confidenceLabel,
                            "confidence"
                          )}`}
                        >
                          {event.confidenceLabel} Confidence
                        </span>

                        <span
                          className={`rounded border px-2 py-1 ${getBadgeClass(
                            event.importanceLabel,
                            "importance"
                          )}`}
                        >
                          {event.importanceLabel}
                        </span>

                        <span className="rounded border border-gray-700 bg-black px-2 py-1 text-gray-300">
                          {event.sourceCount} Sources
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Sources
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {event.sources.slice(0, 4).map((source, index) => (
                          <span
                            key={`${event.id}-list-source-${index}`}
                            className="rounded border border-gray-700 bg-black px-2 py-1 text-xs text-gray-300"
                          >
                            {source}
                          </span>
                        ))}

                        {event.sources.length > 4 && (
                          <span className="rounded border border-gray-700 bg-black px-2 py-1 text-xs text-gray-400">
                            +{event.sources.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-gray-500">
                      Coordinates: {event.position[0]}, {event.position[1]}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">Heat Intensity Queue</h2>

            {radarEvents.length === 0 ? (
              <p className="text-gray-400">No heat events available.</p>
            ) : (
              <div className="space-y-4">
                {radarEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border border-gray-800 bg-gray-950 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <p className="mt-1 text-sm text-gray-400">
                          {event.region}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-red-300">
                          Heat: {getHeatLabel(event.importanceScore)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Importance Score: {event.importanceScore}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded bg-gray-800">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${Math.min(event.importanceScore, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}