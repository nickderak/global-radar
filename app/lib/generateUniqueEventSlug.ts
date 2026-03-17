import { prisma } from "./prisma";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateUniqueEventSlug(title: string) {
  const baseSlug = slugify(title) || "event";
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.event.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}