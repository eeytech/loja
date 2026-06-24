import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/lib/session";
import ReactQueryProvider from "@/providers/react-query";
import { SessionProvider } from "@/providers/session-provider";

// Inter é a fonte sans-serif padrão para interfaces de tecnologia — legível,
// moderna e amplamente utilizada em dashboards e SaaS.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TECHPEAK — Equipamentos e Periféricos",
  description:
    "Loja especializada em equipamentos, peças, periféricos e serviços de tecnologia.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} antialiased`}>
        <SessionProvider initialUser={session?.user ?? null}>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </SessionProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
