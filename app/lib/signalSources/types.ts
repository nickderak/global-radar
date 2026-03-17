export type ExternalSignal = {
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

export type SignalSourceResult = {
  sourceKey: string;
  fetchedCount: number;
  signals: ExternalSignal[];
};

export interface SignalSource {
  key: string;
  displayName: string;
  fetchSignals(): Promise<SignalSourceResult>;
}