import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FIRE Masterplan Simulator – Family Office Dashboard",
  description:
    "Simulate your path to financial independence with the FIRE Masterplan Simulator. German tax model, Monte Carlo simulation, and more. Simulieren Sie Ihren Weg zur finanziellen Unabhängigkeit.",
  keywords: ["FIRE", "Financial Independence", "Retire Early", "Simulator", "German Tax", "Abgeltungssteuer", "Monte Carlo", "ETF"],
  authors: [{ name: "FIRE Simulator" }],
  openGraph: {
    title: "FIRE Masterplan Simulator",
    description: "Plan your path to financial independence with Monte Carlo simulation, German tax modeling, and real-time projections.",
    type: "website",
    locale: "de_DE",
    alternateLocale: "en_US",
    siteName: "FIRE Masterplan Simulator",
  },
  twitter: {
    card: "summary_large_image",
    title: "FIRE Masterplan Simulator",
    description: "Plan your path to financial independence with Monte Carlo simulation, German tax modeling, and real-time projections.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('fire-simulator-theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
