import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import "./globals.css";

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
      <body
        className={`${inter.variable} ${libreBaskerville.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
