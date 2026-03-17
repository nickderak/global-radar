export type VelocityResult = {
  isBreaking: boolean;
  velocityLabel: string;
  recommendedImportanceScore: number;
  recommendedImportanceLabel: string;
};

export function evaluateSignalVelocity(sourceCount: number): VelocityResult {
  if (sourceCount >= 5) {
    return {
      isBreaking: true,
      velocityLabel: "Breaking",
      recommendedImportanceScore: 95,
      recommendedImportanceLabel: "Global Event",
    };
  }

  if (sourceCount >= 3) {
    return {
      isBreaking: false,
      velocityLabel: "Accelerating",
      recommendedImportanceScore: 75,
      recommendedImportanceLabel: "High Importance",
    };
  }

  return {
    isBreaking: false,
    velocityLabel: "Normal",
    recommendedImportanceScore: 50,
    recommendedImportanceLabel: "Medium Importance",
  };
}