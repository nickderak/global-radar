type RawSignal = {
  source: string;
  sourceType: string;
  title: string;
  description: string;
  timestamp: string;
  category: string;
  region: string;
  country: string;
  locationLabel: string;
  actors?: string[];
  keywords?: string[];
  rawUrl?: string;
  confidenceSeed?: string;
};

export function normalizeIncomingSignal(signal: RawSignal) {
  return {
    source: signal.source,
    sourceType: signal.sourceType,
    title: signal.title.trim(),
    description: signal.description.trim(),
    timestamp: new Date(signal.timestamp),
    category: signal.category.trim(),
    region: signal.region.trim(),
    country: signal.country.trim(),
    locationLabel: signal.locationLabel.trim(),
    actorsJson: signal.actors ?? [],
    keywordsJson: signal.keywords ?? [],
    rawUrl: signal.rawUrl ?? "",
    confidenceSeed: signal.confidenceSeed ?? "Medium",
  };
}