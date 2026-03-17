export function buildTimelineEntry(report: {
  timestamp: Date | string;
  source: string;
  title: string;
}) {
  const time = new Date(report.timestamp).toUTCString();

  return `${time} — ${report.source} reported: ${report.title}`;
}