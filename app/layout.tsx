import type { Metadata } from "next";
import "./globals.css";
import GlobalHeader from "./components/GlobalHeader";
import PublicFooter from "./components/PublicFooter";

export const metadata: Metadata = {
  title: "Global Radar",
  description:
    "Real-time global event detection platform with live event feeds, radar visualization, and multi-source signal monitoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <GlobalHeader />
        {children}
        <PublicFooter />
      </body>
    </html>
  );
}