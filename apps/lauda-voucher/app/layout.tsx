import type { Metadata } from "next";
import { Bevan, WDXL_Lubrifont_TC } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";

const bevan = Bevan({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const lubrifont = WDXL_Lubrifont_TC({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Stammheimer Seifenkistenrennen App",
  description:
    "Eventzentrale fur Gutscheine, Teamverwaltung und weitere Rennorganisation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${bevan.variable} ${lubrifont.variable} min-h-screen bg-gray-100 text-gray-800 antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
