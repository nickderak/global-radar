import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const events = [
    {
      slug: "japan-earthquake-test",
      title: "Moderate earthquake detected near Tokyo",
      description:
        "Seismic sensors detected a moderate offshore earthquake with no immediate major damage reports.",
      eventTime: new Date(),
      category: "Disaster",
      region: "Asia-Pacific",
      country: "Japan",
      locationLabel: "Tokyo",
      confidenceScore: 78,
      confidenceLabel: "High",
      importanceScore: 70,
      importanceLabel: "High Importance",
      status: "Confirmed",
      sourceCount: 4,
      sourcesJson: ["USGS", "Reuters", "NHK", "Local Authorities"],
      timelineJson: [
        `${new Date().toUTCString()} — Initial seismic detection`,
        `${new Date().toUTCString()} — Regional monitoring agencies confirmed event`,
      ],
    },
    {
      slug: "ukraine-drone-strike-test",
      title: "Drone strike reported near eastern Ukraine logistics hub",
      description:
        "Multiple reports indicate a drone strike disrupted logistics operations near an eastern Ukraine transport node.",
      eventTime: new Date(),
      category: "Military",
      region: "Europe",
      country: "Ukraine",
      locationLabel: "Eastern Ukraine",
      confidenceScore: 72,
      confidenceLabel: "High",
      importanceScore: 82,
      importanceLabel: "High Importance",
      status: "Developing",
      sourceCount: 5,
      sourcesJson: ["Reuters", "Regional Media", "Defense Monitor", "OSINT Feed", "Local Officials"],
      timelineJson: [
        `${new Date().toUTCString()} — First strike reports emerged`,
        `${new Date().toUTCString()} — Follow-up logistics disruption reported`,
      ],
    },
    {
      slug: "washington-emergency-briefing-test",
      title: "Emergency federal briefing announced in Washington",
      description:
        "A sudden federal briefing was scheduled in Washington following heightened security concerns.",
      eventTime: new Date(),
      category: "Politics",
      region: "North America",
      country: "United States",
      locationLabel: "Washington",
      confidenceScore: 63,
      confidenceLabel: "Medium",
      importanceScore: 58,
      importanceLabel: "Medium Importance",
      status: "Developing",
      sourceCount: 3,
      sourcesJson: ["AP", "Reuters", "Federal Statement"],
      timelineJson: [
        `${new Date().toUTCString()} — Briefing announcement published`,
      ],
    },
    {
      slug: "taiwan-naval-activity-test",
      title: "Naval activity reported near Taiwan Strait",
      description:
        "Defense monitoring sources reported elevated naval maneuvering activity near the Taiwan Strait.",
      eventTime: new Date(),
      category: "Military",
      region: "East Asia",
      country: "Taiwan",
      locationLabel: "Taiwan Strait",
      confidenceScore: 69,
      confidenceLabel: "Medium",
      importanceScore: 76,
      importanceLabel: "High Importance",
      status: "Monitoring",
      sourceCount: 4,
      sourcesJson: ["Defense Monitor", "Regional Press", "Satellite Review", "Maritime Tracking"],
      timelineJson: [
        `${new Date().toUTCString()} — Naval movement detected`,
      ],
    },
    {
      slug: "brazil-power-grid-test",
      title: "Power grid instability reported in southeastern Brazil",
      description:
        "Regional energy operators reported instability affecting parts of the southeastern grid.",
      eventTime: new Date(),
      category: "Infrastructure",
      region: "South America",
      country: "Brazil",
      locationLabel: "Southeastern Brazil",
      confidenceScore: 57,
      confidenceLabel: "Medium",
      importanceScore: 52,
      importanceLabel: "Medium Importance",
      status: "Developing",
      sourceCount: 2,
      sourcesJson: ["Regional Utility", "Local Media"],
      timelineJson: [
        `${new Date().toUTCString()} — Grid instability first reported`,
      ],
    },
    {
      slug: "israel-air-defense-test",
      title: "Air defense activity reported near central Israel",
      description:
        "Witness and monitoring reports indicate air defense systems were activated near central Israel.",
      eventTime: new Date(),
      category: "Military",
      region: "Middle East",
      country: "Israel",
      locationLabel: "Central Israel",
      confidenceScore: 74,
      confidenceLabel: "High",
      importanceScore: 80,
      importanceLabel: "High Importance",
      status: "Developing",
      sourceCount: 5,
      sourcesJson: ["Reuters", "Defense Monitor", "Regional Press", "Government Source", "Witness Reports"],
      timelineJson: [
        `${new Date().toUTCString()} — Air defense activity detected`,
      ],
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {
        title: event.title,
        description: event.description,
        eventTime: event.eventTime,
        category: event.category,
        region: event.region,
        country: event.country,
        locationLabel: event.locationLabel,
        confidenceScore: event.confidenceScore,
        confidenceLabel: event.confidenceLabel,
        importanceScore: event.importanceScore,
        importanceLabel: event.importanceLabel,
        status: event.status,
        sourceCount: event.sourceCount,
        sourcesJson: event.sourcesJson,
        timelineJson: event.timelineJson,
      },
      create: event,
    });
  }

  console.log(`Seeded ${events.length} multi-region events.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });