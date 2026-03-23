import { ingestSignals } from "./ingestSignals";
import { registeredSignalSources } from "./signalSources/index";
import type { ExternalSignal } from "./signalSources/types";

export async function runExternalSources() {
  const sourceResults: { sourceKey: string; fetchedCount: number }[] = [];
  const allSignals: ExternalSignal[] = [];

  for (const source of registeredSignalSources) {
    try {
      const result = await source.fetchSignals();

      sourceResults.push({
        sourceKey: result.sourceKey,
        fetchedCount: result.fetchedCount,
      });

      allSignals.push(...result.signals);
    } catch (error) {
      console.error(`Source failed: ${source.key}`, error);

      sourceResults.push({
        sourceKey: source.key,
        fetchedCount: 0,
      });
    }
  }

  const ingestionResult =
    allSignals.length > 0 ? await ingestSignals(allSignals) : null;

  return {
    sourceCount: registeredSignalSources.length,
    sourceResults,
    totalSignalsFetched: allSignals.length,
    ingestionResult,
  };
}