import { ingestSignals } from "./ingestSignals";
import { generateSimulatedSignals } from "./signalSimulator";
import { logIngestionRun } from "./logIngestionRun";

let running = false;

export async function startLiveSignalStream() {
  if (running) return;

  running = true;

  console.log("Live signal stream started");

  while (running) {
    try {
      const signals = generateSimulatedSignals(1);

      const result = await ingestSignals(signals);

      await logIngestionRun({
        runType: "live-stream",
        generatedCount: signals.length,
        insertedCount: result.insertedCount,
        processingResults: result.processingResults,
      });

      console.log("Signal processed:", result.insertedCount);
    } catch (err) {
      console.error("Signal stream error:", err);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

export function stopLiveSignalStream() {
  running = false;
}