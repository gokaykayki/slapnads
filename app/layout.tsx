import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProvider from "./providers/client-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SlapNads",
  description: "Slap the Shitposters - Battle Arena",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
