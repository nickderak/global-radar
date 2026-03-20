"use client";

type Props = {
  count: number;
};

export default function LiveAlertBanner({ count }: Props) {
  if (count === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
      <div className="animate-pulse rounded-lg border border-red-700 bg-red-950 px-6 py-3 shadow-lg">
        <p className="text-sm font-semibold text-red-300">
          🚨 {count} New Event{count === 1 ? "" : "s"} Detected
        </p>
      </div>
    </div>
  );
}