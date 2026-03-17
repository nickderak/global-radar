import { events } from "../data/events";
import { incomingReports } from "../data/incomingReports";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function keywordOverlap(a: string[], b: string[]) {
  const aSet = new Set(a.map((item) => normalize(item)));
  const bSet = new Set(b.map((item) => normalize(item)));

  let matches = 0;

  for (const item of aSet) {
    if (bSet.has(item)) {
      matches++;
    }
  }

  return matches;
}

function getDecision(score: number) {
  if (score >= 70) return "Merge";
  if (score >= 40) return "Review";
  return "New Event";
}

export function compareReportsToEvents() {
  return incomingReports.map((report) => {
    const matches = events.map((event) => {
      let score = 0;
      const reasons: string[] = [];

      const categoryMatch =
        normalize(report.category) === normalize(event.category);
      if (categoryMatch) {
        score += 30;
        reasons.push("Category matched (+30)");
      }

      const regionMatch = normalize(report.region) === normalize(event.region);
      if (regionMatch) {
        score += 25;
        reasons.push("Region matched (+25)");
      }

      const reportLocation = normalize(report.locationLabel);
      const eventTitle = normalize(event.title);
      const eventDescription = normalize(event.description);

      const locationMatch =
        eventTitle.includes(reportLocation) ||
        eventDescription.includes(reportLocation);

      if (locationMatch) {
        score += 25;
        reasons.push("Location matched (+25)");
      }

      const overlap = keywordOverlap(report.keywords, [
        ...event.title.split(" "),
        ...event.description.split(" "),
      ]);

      const keywordPoints = Math.min(overlap * 5, 20);
      score += keywordPoints;

      if (keywordPoints > 0) {
        reasons.push(`Keyword overlap: ${overlap} (+${keywordPoints})`);
      }

      if (reasons.length === 0) {
        reasons.push("No strong match signals found");
      }

      return {
        reportTitle: report.title,
        eventTitle: event.title,
        score,
        reasons,
      };
    });

    const bestMatch = matches.sort((a, b) => b.score - a.score)[0];
    const decision = getDecision(bestMatch?.score ?? 0);

    return {
      report: report.title,
      bestMatch,
      decision,
    };
  });
}