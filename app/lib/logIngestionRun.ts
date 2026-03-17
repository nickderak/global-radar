import { prisma } from "./prisma";

type ProcessingItem = {
  reportId: string;
  title: string;
  result: unknown;
};

function getAction(result: unknown): string {
  if (
    typeof result === "object" &&
    result !== null &&
    "action" in result &&
    typeof (result as { action?: unknown }).action === "string"
  ) {
    return (result as { action: string }).action;
  }

  return "unknown";
}

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
    const action = getAction(item.result);

    if (action === "create") createdCount++;
    else if (action === "merged") mergedCount++;
    else if (action === "review") reviewCount++;
    else if (action === "error") errorCount++;
  }

  const notesJson = input.processingResults.map((item) => ({
    reportId: item.reportId,
    title: item.title,
    action: getAction(item.result),
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