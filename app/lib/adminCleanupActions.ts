"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

export async function deleteEventAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");

  if (!eventId) {
    throw new Error("Missing eventId");
  }

  await prisma.event.delete({
    where: { id: eventId },
  });

  revalidatePath("/events");
  revalidatePath("/radar");
  revalidatePath("/debug/ingest");
  revalidatePath("/admin/cleanup");
}

export async function deleteIngestionRunAction(formData: FormData) {
  const runId = String(formData.get("runId") ?? "");

  if (!runId) {
    throw new Error("Missing runId");
  }

  await prisma.ingestionRun.delete({
    where: { id: runId },
  });

  revalidatePath("/debug/ingest");
  revalidatePath("/admin/cleanup");
}