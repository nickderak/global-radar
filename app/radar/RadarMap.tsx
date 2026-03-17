"use client";

import dynamic from "next/dynamic";

const RadarMapInner = dynamic(() => import("./RadarMapInner"), {
  ssr: false,
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
};

export default function RadarMap({ events }: { events: RadarEvent[] }) {
  return <RadarMapInner events={events} />;
}