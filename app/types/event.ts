export type EventRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;

  eventTime: string;
  createdAt: string;
  updatedAt: string;

  category: string;
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