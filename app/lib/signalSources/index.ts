import { mockWorldSource } from "./mockWorldSource";
import { usgsEarthquakeSource } from "./usgsEarthquakeSource";
import { nwsAlertsSource } from "./nwsAlertsSource";
import { gdacsAlertsSource } from "./gdacsAlertsSource";
import { indiaGovSource } from "./indiaGovSource";
import { japanMofaSource } from "./japanMofaSource";
import { israelGovSource } from "./israelGovSource";
import { unSecurityCouncilSource } from "./unSecurityCouncilSource";
import { pakistanGovSource } from "./pakistanGovSource";
import type { SignalSource } from "./types";

export const registeredSignalSources: SignalSource[] = [
  mockWorldSource,
  usgsEarthquakeSource,
  nwsAlertsSource,
  gdacsAlertsSource,
  indiaGovSource,
  japanMofaSource,
  israelGovSource,
  unSecurityCouncilSource,
  pakistanGovSource,
];