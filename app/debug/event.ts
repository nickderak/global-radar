export type EventRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;

  eventTime: string;
  createdAt: string;
  updatedAt: string;

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

  confidenceScore: number;
  confidenceLabel: "Low" | "Medium" | "High";

  importanceScore: number;
  importanceLabel: "Low" | "Medium" | "High" | "Critical";

  status: "Confirmed" | "Developing";

  sourceCount: number;
  sources: string[];

  timeline: string[];
};