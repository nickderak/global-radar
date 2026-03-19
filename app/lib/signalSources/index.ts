import { usgsEarthquakeSource } from "./usgsEarthquakeSource";
import type { SignalSource } from "./types";

export const registeredSignalSources: SignalSource[] = [
  usgsEarthquakeSource,
];