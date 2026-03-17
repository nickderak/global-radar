import { prisma } from "./prisma";

export async function deleteEventById(eventId: string) {
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
  });

  if (!event) {
    return {
      deleted: false,
      reason: "Event not found",
    };
  }

  await prisma.event.delete({
    where: {
      id: eventId,
    },
  });

  return {
    deleted: true,
    event: {
      id: event.id,
      slug: event.slug,
      title: event.title,
    },
  };
}