import type { Metadata, Viewport } from "next";
import { Public_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";

const publicSans = Public_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://box2eat.com"),
  title: "Box2eat",
  description: "Peça comida dos melhores restaurantes perto de você",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Box2eat",
  },
};

export const viewport: Viewport = {
  themeColor: "#e55e1e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${publicSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers header={<SiteHeader />} bottomNav={<BottomNav />}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
