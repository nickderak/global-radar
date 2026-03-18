"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import Link from "next/link";
import { useRouter } from "next/navigation";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

function getMarkerRadius(score: number) {
  if (score >= 90) return 18;
  if (score >= 75) return 14;
  if (score >= 50) return 10;
  return 7;
}

function getMarkerOpacity(score: number) {
  if (score >= 90) return 0.9;
  if (score >= 75) return 0.8;
  if (score >= 50) return 0.7;
  return 0.55;
}

export default function RadarMapInner({ events }: { events: RadarEvent[] }) {
  const router = useRouter();
  const mapCenter: LatLngExpression = [20, 0];

  return (
    <div style={{ height: "80vh", width: "100%" }}>
      <MapContainer
        center={mapCenter}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {events.map((event) => (
          <CircleMarker
            key={event.id}
            center={event.position}
            radius={getMarkerRadius(event.importanceScore)}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: getMarkerOpacity(event.importanceScore),
            }}
            eventHandlers={{
              click: () => {
                router.push(`/events/${event.slug}`);
              },
            }}
          >
            <Popup>
              <div className="min-w-[260px] text-black">
                <p className="font-semibold">{event.title}</p>
                <p className="mt-1 text-xs text-gray-600">
                  {event.region} · {event.category}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded border border-gray-400 px-2 py-1">
                    {event.confidenceLabel} Confidence
                  </span>
                  <span className="rounded border border-gray-400 px-2 py-1">
                    {event.importanceLabel}
                  </span>
                  <span className="rounded border border-gray-400 px-2 py-1">
                    {event.sourceCount} Sources
                  </span>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  {new Date(event.eventTime).toUTCString()}
                </p>

                <div className="mt-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Sources
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {event.sources.slice(0, 4).map((source, index) => (
                      <span
                        key={`${event.id}-popup-source-${index}`}
                        className="rounded border border-gray-400 px-2 py-1 text-[11px]"
                      >
                        {source}
                      </span>
                    ))}

                    {event.sources.length > 4 && (
                      <span className="rounded border border-gray-400 px-2 py-1 text-[11px]">
                        +{event.sources.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <Link
                    href={`/events/${event.slug}`}
                    className="text-sm text-blue-600 underline"
                  >
                    Open Event
                  </Link>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}