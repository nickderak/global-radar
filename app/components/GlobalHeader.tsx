import Link from "next/link";

const publicNavItems = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Event Feed" },
  { href: "/radar", label: "Radar" },
];

const adminNavItems = [
  { href: "/review", label: "Review Queue" },
  { href: "/debug/ingest", label: "Ingestion" },
  { href: "/admin/cleanup", label: "Cleanup" },
];

export default function GlobalHeader() {
  return (
    <header className="border-b border-gray-800 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 text-white">
        <Link href="/" className="text-lg font-bold tracking-wide">
          Global Radar
        </Link>

        <div className="flex flex-wrap items-center gap-6">
          <nav className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded border border-gray-800 px-3 py-2 transition hover:border-gray-500 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <nav className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded border border-gray-900 px-2 py-1 transition hover:border-gray-700 hover:text-gray-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}