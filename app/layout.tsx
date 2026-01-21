import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getStoreWhoami } from "@/lib/api-client";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Duster Theme - Premium Gaming Products",
  description: "Your one-stop shop for premium gaming products, VIP ranks, and exclusive perks",
  icons: {
    icon: '/duster-theme-logo.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch store info server-side for SSR
  const initialStore = await getStoreWhoami();

  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <div className="min-h-screen flex flex-col">
            <Header initialStore={initialStore} />
            <main className="flex-1">
              {children}
            </main>
            <Footer initialStore={initialStore} />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
