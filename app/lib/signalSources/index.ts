import { usgsEarthquakeSource } from "./usgsEarthquakeSource";
import { nwsAlertsSource } from "./nwsAlertsSource";
import { gdacsAlertsSource } from "./gdacsAlertsSource";
import { ukFcdoSource } from "./ukFcdoSource";
import { unSecurityCouncilSource } from "./unSecurityCouncilSource";
import { apSource } from "./apSource";
import type { SignalSource } from "./types";

export const registeredSignalSources: SignalSource[] = [
  usgsEarthquakeSource,
  nwsAlertsSource,
  gdacsAlertsSource,
  ukFcdoSource,
  unSecurityCouncilSource,
  apSource,
];