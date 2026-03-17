type SourceType =
  | "News Wire"
  | "National Media"
  | "Government"
  | "Emergency Agency"
  | "Sensor Feed"
  | "Manual Entry";

export function getBaseSourceScore(sourceTypes: SourceType[]) {
  let bestScore = 0;
  const reasons: string[] = [];

  for (const sourceType of sourceTypes) {
    let score = 0;

    switch (sourceType) {
      case "Government":
      case "Emergency Agency":
        score = 35;
        break;
      case "News Wire":
        score = 30;
        break;
      case "Sensor Feed":
        score = 25;
        break;
      case "National Media":
        score = 20;
        break;
      case "Manual Entry":
        score = 10;
        break;
      default:
        score = 0;
    }

    if (score > bestScore) {
      bestScore = score;
    }
  }

  if (bestScore > 0) {
    reasons.push(`Base source trust: +${bestScore}`);
  }

  return { score: bestScore, reasons };
}

export function getSourceCountBonus(sourceCount: number) {
  let bonus = 0;

  if (sourceCount >= 4) bonus = 25;
  else if (sourceCount === 3) bonus = 20;
  else if (sourceCount === 2) bonus = 10;

  const reasons = bonus > 0 ? [`Source count bonus: +${bonus}`] : [];
  return { score: bonus, reasons };
}

export function getOfficialConfirmationBonus(sourceTypes: SourceType[]) {
  const hasOfficial = sourceTypes.some(
    (type) => type === "Government" || type === "Emergency Agency"
  );

  const bonus = hasOfficial ? 20 : 0;
  const reasons = bonus > 0 ? [`Official confirmation bonus: +${bonus}`] : [];

  return { score: bonus, reasons };
}

export function getStatusBonus(status: string) {
  const normalized = status.toLowerCase();
  const bonus = normalized === "confirmed" ? 10 : 0;
  const reasons = bonus > 0 ? [`Confirmed status bonus: +${bonus}`] : [];

  return { score: bonus, reasons };
}

export function getConfidenceLabel(score: number) {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export function calculateConfidence(input: {
  sourceTypes: SourceType[];
  sourceCount: number;
  status: string;
}) {
  const reasons: string[] = [];

  const base = getBaseSourceScore(input.sourceTypes);
  const sourceCount = getSourceCountBonus(input.sourceCount);
  const official = getOfficialConfirmationBonus(input.sourceTypes);
  const status = getStatusBonus(input.status);

  const total =
    base.score + sourceCount.score + official.score + status.score;

  reasons.push(...base.reasons);
  reasons.push(...sourceCount.reasons);
  reasons.push(...official.reasons);
  reasons.push(...status.reasons);

  return {
    confidenceScore: total,
    confidenceLabel: getConfidenceLabel(total),
    confidenceReasons: reasons,
  };
}