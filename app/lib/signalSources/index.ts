import { usgsEarthquakeSource } from "./usgsEarthquakeSource";
import { nwsAlertsSource } from "./nwsAlertsSource";
import { gdacsAlertsSource } from "./gdacsAlertsSource";
import { chinaGovSource } from "./chinaGovSource";
import { ukFcdoSource } from "./ukFcdoSource";
import type { SignalSource } from "./types";

export const registeredSignalSources: SignalSource[] = [
  usgsEarthquakeSource,
  nwsAlertsSource,
  gdacsAlertsSource,
  chinaGovSource,
  ukFcdoSource,
];