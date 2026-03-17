export type CredibilityResult = {
  score: number;
  label: string;
};

export function getSourceCredibility(sourceType: string): CredibilityResult {
  const type = sourceType.toLowerCase();

  if (type.includes("government")) {
    return { score: 95, label: "Very High Credibility" };
  }

  if (
    type.includes("news wire") ||
    type.includes("reuters") ||
    type.includes("ap") ||
    type.includes("bloomberg")
  ) {
    return { score: 85, label: "High Credibility" };
  }

  if (type.includes("news")) {
    return { score: 70, label: "Medium Credibility" };
  }

  if (type.includes("social")) {
    return { score: 40, label: "Low Credibility" };
  }

  return { score: 50, label: "Unknown Credibility" };
}