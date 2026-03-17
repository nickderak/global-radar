export type IncomingReport = {
  source: string;
  sourceType:
    | "News Wire"
    | "National Media"
    | "Government"
    | "Emergency Agency"
    | "Sensor Feed"
    | "Manual Entry";
  title: string;
  description: string;
  timestamp: string;
  category:
    | "Military / Conflict"
    | "Energy"
    | "Finance / Monetary"
    | "Politics / Government"
    | "Trade / Supply Chain"
    | "Cybersecurity"
    | "Natural Disasters"
    | "Public Health"
    | "Infrastructure"
    | "Technology";
  region: string;
  country: string;
  locationLabel: string;
  actors: string[];
  keywords: string[];
  rawUrl: string;
  confidenceSeed: "Low" | "Medium" | "High";
};