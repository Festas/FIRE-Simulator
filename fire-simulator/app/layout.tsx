import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FIRE Masterplan Simulator – Family Office Dashboard",
  description:
    "Simulieren Sie Ihren Weg zur finanziellen Unabhängigkeit über einen 20-Jahres-Zeitraum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
