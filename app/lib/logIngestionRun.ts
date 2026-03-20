import { prisma } from "./prisma";

type ProcessingItem = {
  signalTitle: string;
  status: "inserted" | "merged";
};

export async function logIngestionRun(input: {
  runType: string;
  generatedCount: number;
  insertedCount: number;
  processingResults: ProcessingItem[];
}) {
  let createdCount = 0;
  let mergedCount = 0;
  let reviewCount = 0;
  let errorCount = 0;

  for (const item of input.processingResults) {
    if (item.status === "inserted") createdCount++;
    else if (item.status === "merged") mergedCount++;
  }

  const notesJson = input.processingResults.map((item) => ({
    title: item.signalTitle,
    action: item.status,
  }));

  const run = await prisma.ingestionRun.create({
    data: {
      runType: input.runType,
      generatedCount: input.generatedCount,
      insertedCount: input.insertedCount,
      createdCount,
      mergedCount,
      reviewCount,
      errorCount,
      notesJson,
    },
  });

  return run;
}