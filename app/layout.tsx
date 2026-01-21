import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
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
          <div className="min-h-screen">
            {/* Fixed chrome */}
            <Sidebar initialStore={initialStore} />
            <Topbar initialStore={initialStore} />
            <MobileNav />

            {/* Content area offset for sidebar/topbar and mobile bottom nav */}
            <main className="pt-16 md:pl-20 pb-20 md:pb-0">
              {children}
            </main>

            <div className="md:pl-20 pb-20 md:pb-0">
              <Footer initialStore={initialStore} />
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
