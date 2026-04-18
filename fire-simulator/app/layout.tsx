import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FIRE Masterplan Simulator – Family Office Dashboard",
  description:
    "Simulate your path to financial independence with the FIRE Masterplan Simulator. Multi-country tax models, Monte Carlo simulation, life events, and more.",
  keywords: ["FIRE", "Financial Independence", "Retire Early", "Simulator", "Tax", "Abgeltungssteuer", "Monte Carlo", "ETF", "Life Events"],
  authors: [{ name: "FIRE Simulator" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "FIRE Masterplan Simulator",
    description: "Plan your path to financial independence with Monte Carlo simulation, multi-country tax modeling, life events, and real-time projections.",
    type: "website",
    locale: "de_DE",
    alternateLocale: "en_US",
    siteName: "FIRE Masterplan Simulator",
  },
  twitter: {
    card: "summary_large_image",
    title: "FIRE Masterplan Simulator",
    description: "Plan your path to financial independence with Monte Carlo simulation, multi-country tax modeling, life events, and real-time projections.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
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
        <meta name="theme-color" content="#10b981" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('fire-simulator-theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden">{children}</body>
    </html>
  );
}
