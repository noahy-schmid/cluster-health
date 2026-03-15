import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import NotificationContainer from "@/components/notifications/NotificationContainer";
import Script from "next/dist/client/script";

export const metadata: Metadata = {
  title: "dein.salon - Salon Management",
  description: "Professionelle B2B-Plattform für Friseursalons",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="antialiased">
        <Providers>
          <NotificationContainer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
