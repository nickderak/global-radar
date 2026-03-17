import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const report = await prisma.incomingReport.create({
    data: {
      source: "Reuters",
      sourceType: "News Wire",
      title: "Missile launches reported in Eastern Mediterranean",
      description:
        "Multiple missile launches detected near the Eastern Mediterranean according to regional monitoring sources.",
      timestamp: new Date(),
      category: "Military",
      region: "Middle East",
      country: "International Waters",
      locationLabel: "Eastern Mediterranean",
      actorsJson: ["Unknown"],
      keywordsJson: ["missile", "launch", "military"],
      rawUrl: "https://example.com/test-review-report",
      confidenceSeed: "Medium",
    },
  });

  console.log("Inserted IncomingReport:", report);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });