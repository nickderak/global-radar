export type ImportanceResult = {
  score: number;
  label: string;
};

export function calculateImportance(sourceCount: number): ImportanceResult {
  if (sourceCount >= 10) {
    return { score: 90, label: "Global Event" };
  }

  if (sourceCount >= 6) {
    return { score: 75, label: "High Importance" };
  }

  if (sourceCount >= 3) {
    return { score: 50, label: "Medium Importance" };
  }

  return { score: 25, label: "Low Importance" };
}