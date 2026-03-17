import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { processIncomingReport } from "../../lib/processIncomingReport";

export default async function ClusterTestPage() {
  const report = await prisma.incomingReport.findFirst({
    orderBy: { timestamp: "desc" },
  });

  if (!report) {
    return <div>No Incoming Reports</div>;
  }

  const result = await processIncomingReport(report.id);

  return (
    <main className="min-h-screen bg-black text-white px-8 py-10">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">Cluster Engine Test</h1>

        <div className="border border-gray-800 p-6 rounded-lg">

          <p className="text-gray-300 mb-4">
            Latest report processed:
          </p>

          <p className="text-lg font-semibold">{report.title}</p>

          <div className="mt-6 text-sm text-gray-400">
            Result:
          </div>

          <div className="mt-2 text-green-300">
            {JSON.stringify(result)}
          </div>

          <div className="mt-6">
            <Link
              href="/events"
              className="border border-gray-700 px-4 py-2 rounded hover:border-gray-500"
            >
              View Events
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}