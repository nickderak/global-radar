import { watchlistConfig } from "./watchlistConfig";

type Event = {
  region: string;
  category: string;
  importanceScore: number;
};

export function isWatchlistMatch(event: Event): boolean {
  const regionMatch =
    watchlistConfig.regions.length === 0 ||
    watchlistConfig.regions.includes(event.region);

  const categoryMatch =
    watchlistConfig.categories.length === 0 ||
    watchlistConfig.categories.includes(event.category);

  const importanceMatch =
    event.importanceScore >= watchlistConfig.minimumImportanceScore;

  return regionMatch && categoryMatch && importanceMatch;
}