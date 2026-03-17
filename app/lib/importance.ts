export function getCategoryBaseScore(category: string) {
  const normalized = category.toLowerCase();

  switch (normalized) {
    case "military / conflict":
      return { score: 35, reason: "High-impact category" };
    case "energy":
      return { score: 30, reason: "Energy disruption potential" };
    case "finance / monetary":
      return { score: 30, reason: "Financial system relevance" };
    case "trade / supply chain":
      return { score: 28, reason: "Global supply chain relevance" };
    case "infrastructure":
      return { score: 25, reason: "Infrastructure disruption relevance" };
    case "natural disasters":
      return { score: 22, reason: "Disaster impact relevance" };
    case "politics / government":
      return { score: 20, reason: "Government / policy significance" };
    case "cybersecurity":
      return { score: 20, reason: "Cyber disruption relevance" };
    case "public health":
      return { score: 20, reason: "Public health significance" };
    case "technology":
      return { score: 18, reason: "Technology / strategic industry relevance" };
    default:
      return { score: 10, reason: "General event relevance" };
  }
}

export function getRegionBonus(region: string) {
  const normalized = region.toLowerCase();

  switch (normalized) {
    case "middle east":
      return { score: 20, reason: "Strategic global region" };
    case "global":
      return { score: 20, reason: "Global relevance" };
    case "japan":
      return { score: 10, reason: "Major economic region" };
    case "europe":
      return { score: 10, reason: "Major global region" };
    case "united states":
      return { score: 15, reason: "Major strategic region" };
    case "east asia":
      return { score: 15, reason: "High-sensitivity strategic region" };
    default:
      return { score: 0, reason: "" };
  }
}

export function getSourceCountImportance(sourceCount: number) {
  if (sourceCount >= 4) return { score: 15, reason: "Broad source coverage" };
  if (sourceCount === 3) return { score: 10, reason: "Multi-source coverage" };
  if (sourceCount === 2) return { score: 5, reason: "Secondary source confirmation" };
  return { score: 0, reason: "" };
}

export function getStatusImportance(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "confirmed") {
    return { score: 10, reason: "Confirmed event" };
  }

  if (normalized === "developing") {
    return { score: 5, reason: "Developing live situation" };
  }

  return { score: 0, reason: "" };
}

export function getStrategicCategoryBoost(category: string) {
  const normalized = category.toLowerCase();

  switch (normalized) {
    case "military / conflict":
      return { score: 10, reason: "Strategic conflict relevance" };
    case "energy":
      return { score: 10, reason: "Energy market significance" };
    case "finance / monetary":
      return { score: 10, reason: "Market-moving financial significance" };
    case "trade / supply chain":
      return { score: 8, reason: "Global logistics significance" };
    default:
      return { score: 0, reason: "" };
  }
}

export function getImportanceLabel(score: number) {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

export function calculateImportance(input: {
  category: string;
  region: string;
  sourceCount: number;
  status: string;
}) {
  const reasons: string[] = [];

  const categoryBase = getCategoryBaseScore(input.category);
  const regionBonus = getRegionBonus(input.region);
  const sourceCountBonus = getSourceCountImportance(input.sourceCount);
  const statusBonus = getStatusImportance(input.status);
  const strategicBoost = getStrategicCategoryBoost(input.category);

  const total =
    categoryBase.score +
    regionBonus.score +
    sourceCountBonus.score +
    statusBonus.score +
    strategicBoost.score;

  if (categoryBase.reason) reasons.push(`${categoryBase.reason} (+${categoryBase.score})`);
  if (regionBonus.reason) reasons.push(`${regionBonus.reason} (+${regionBonus.score})`);
  if (sourceCountBonus.reason) reasons.push(`${sourceCountBonus.reason} (+${sourceCountBonus.score})`);
  if (statusBonus.reason) reasons.push(`${statusBonus.reason} (+${statusBonus.score})`);
  if (strategicBoost.reason) reasons.push(`${strategicBoost.reason} (+${strategicBoost.score})`);

  return {
    importanceScore: total,
    importanceLabel: getImportanceLabel(total),
    importanceReasons: reasons,
  };
}