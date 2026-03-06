import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import NotificationContainer from "@/components/notifications/NotificationContainer";
import Script from "next/dist/client/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

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
      <body
        className={`${inter.variable} ${libreBaskerville.variable} antialiased`}
      >
        <Providers>
          <NotificationContainer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
