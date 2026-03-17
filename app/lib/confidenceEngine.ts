export function getBaseConfidenceFromSourceType(sourceType: string) {
  switch (sourceType) {
    case "Government":
      return 85;
    case "Emergency Agency":
      return 80;
    case "News Wire":
      return 70;
    case "National Media":
      return 60;
    case "Manual Entry":
      return 40;
    default:
      return 50;
  }
}

export function getConfidenceLabel(score: number) {
  if (score >= 75) return "High";
  if (score >= 50) return "Medium";
  return "Low";
}

export function calculateConfidence(input: {
  sourceType: string;
  sourceCount: number;
  existingScore?: number;
  mode: "create" | "merge";
}) {
  const baseScore = getBaseConfidenceFromSourceType(input.sourceType);

  let score = baseScore;

  if (input.sourceCount >= 2) score += 5;
  if (input.sourceCount >= 3) score += 5;
  if (input.sourceCount >= 5) score += 5;

  if (input.mode === "merge") {
    score += 5;
  }

  if (typeof input.existingScore === "number") {
    score = Math.max(score, input.existingScore);
  }

  if (score > 100) score = 100;

  return {
    confidenceScore: score,
    confidenceLabel: getConfidenceLabel(score),
  };
}