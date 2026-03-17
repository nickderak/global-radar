import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const event = await prisma.event.upsert({
    where: { slug: "test-event-001" },
    update: {},
    create: {
      slug: "test-event-001",
      title: "Database Connection Test Event",
      description:
        "This event confirms the Global Squawk Box database is connected.",
      eventTime: new Date(),
      category: "System",
      region: "Global",
      country: "N/A",
      locationLabel: "Database Test",
      confidenceScore: 90,
      confidenceLabel: "High",
      importanceScore: 50,
      importanceLabel: "Medium",
      status: "Confirmed",
      sourceCount: 1,
      sourcesJson: ["Internal Test"],
      timelineJson: ["Database seed event inserted"],
    },
  });

  console.log("Inserted Event:", event);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });