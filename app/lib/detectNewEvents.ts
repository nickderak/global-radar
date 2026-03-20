type EventItem = {
  id: string;
  eventTime: Date | string;
};

export function detectNewEvents(
  currentEvents: EventItem[],
  previousEventIds: string[]
) {
  const newEvents = currentEvents.filter(
    (event) => !previousEventIds.includes(event.id)
  );

  return {
    newEvents,
    newEventCount: newEvents.length,
    newEventIds: newEvents.map((e) => e.id),
  };
}