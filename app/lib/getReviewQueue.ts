import { prisma } from "./prisma";

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function toWordSet(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
}

function overlapCount(a: Set<string>, b: Set<string>) {
  let count = 0;
  for (const item of a) {
    if (b.has(item)) count++;
  }
  return count;
}

export async function getReviewQueue() {
  const reports = await prisma.incomingReport.findMany({
    orderBy: {
      timestamp: "desc",
    },
  });

  const events = await prisma.event.findMany({
    orderBy: {
      eventTime: "desc",
    },
  });

  const reviewItems: Array<{
    reportId: string;
    reportTitle: string;
    reportSource: string;
    score: number;
    reasons: string[];
    candidateEvent: null | {
      id: string;
      slug: string;
      title: string;
      region: string;
      category: string;
    };
  }> = [];

  for (const report of reports) {
    const reportKeywords = ((report.keywordsJson || []) as any[]).map((k) =>
      String(k).toLowerCase()
    );
    const reportKeywordSet = new Set(reportKeywords);
    const reportTitleWords = toWordSet(report.title);
    const reportDescriptionWords = toWordSet(report.description);
    const reportLocation = normalize(report.locationLabel);

    let bestMatch: any = null;
    let bestScore = 0;
    let bestReasons: string[] = [];

    for (const event of events) {
      let score = 0;
      const reasons: string[] = [];

      if (normalize(event.category) === normalize(report.category)) {
        score += 25;
        reasons.push("Category matched (+25)");
      }

      if (normalize(event.region) === normalize(report.region)) {
        score += 20;
        reasons.push("Region matched (+20)");
      }

      if (
        normalize(event.locationLabel) === reportLocation ||
        normalize(event.title).includes(reportLocation) ||
        normalize(event.description).includes(reportLocation)
      ) {
        score += 20;
        reasons.push("Location matched (+20)");
      }

      const eventTitleWords = toWordSet(event.title);
      const eventDescriptionWords = toWordSet(event.description);

      const titleOverlap = overlapCount(reportTitleWords, eventTitleWords);
      const descriptionOverlap = overlapCount(
        reportDescriptionWords,
        eventDescriptionWords
      );

      if (titleOverlap > 0) {
        const titlePoints = Math.min(titleOverlap * 5, 15);
        score += titlePoints;
        reasons.push(`Title overlap (${titleOverlap}) (+${titlePoints})`);
      }

      if (descriptionOverlap > 0) {
        const descriptionPoints = Math.min(descriptionOverlap * 3, 12);
        score += descriptionPoints;
        reasons.push(
          `Description overlap (${descriptionOverlap}) (+${descriptionPoints})`
        );
      }

      const eventSourceWords = ((event.sourcesJson || []) as any[]).map((k) =>
        String(k).toLowerCase()
      );
      const eventSourceSet = new Set(eventSourceWords);

      let keywordMatches = 0;
      for (const keyword of reportKeywordSet) {
        if (
          eventSourceSet.has(keyword) ||
          eventTitleWords.has(keyword) ||
          eventDescriptionWords.has(keyword)
        ) {
          keywordMatches++;
        }
      }

      if (keywordMatches > 0) {
        const keywordPoints = Math.min(keywordMatches * 4, 16);
        score += keywordPoints;
        reasons.push(`Keyword overlap (${keywordMatches}) (+${keywordPoints})`);
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = event;
        bestReasons = reasons;
      }
    }

    if (bestMatch && bestScore >= 25 && bestScore < 45) {
      reviewItems.push({
        reportId: report.id,
        reportTitle: report.title,
        reportSource: report.source,
        score: bestScore,
        reasons: bestReasons,
        candidateEvent: {
          id: bestMatch.id,
          slug: bestMatch.slug,
          title: bestMatch.title,
          region: bestMatch.region,
          category: bestMatch.category,
        },
      });
    }
  }

  return reviewItems;
}