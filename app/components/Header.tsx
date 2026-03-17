import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-800 bg-black">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
        <Link href="/" className="text-lg font-semibold tracking-wide">
          GLOBAL SQUAWK BOX
        </Link>

        <nav className="flex gap-6 text-sm text-gray-300">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <Link href="/events" className="hover:text-white">
            Live Feed
          </Link>
        </nav>
      </div>
    </header>
  );
}