import { prisma } from "./prisma";

type EventRecord = {
  id: string;
  slug: string;
  title: string;
  createdAt: Date;
  confidenceLabel: string;
  confidenceScore: number;
  sourceCount: number;
};

export async function getDuplicateEvents() {
  const events = await prisma.event.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  const groups = new Map<string, EventRecord[]>();

  for (const event of events) {
    const key = event.title.trim().toLowerCase();

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key)!.push({
      id: event.id,
      slug: event.slug,
      title: event.title,
      createdAt: event.createdAt,
      confidenceLabel: event.confidenceLabel,
      confidenceScore: event.confidenceScore,
      sourceCount: event.sourceCount,
    });
  }

  const duplicates = Array.from(groups.values())
    .filter((group) => group.length > 1)
    .map((group) => {
      const keep = group[0];
      const remove = group.slice(1);

      return {
        title: keep.title,
        keep,
        remove,
        duplicateCount: group.length,
      };
    });

  return duplicates;
}
