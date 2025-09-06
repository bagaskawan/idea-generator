import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from "@/components/ui/sonner";
import ClientOnly from "@/components/root/ClientOnly";
import NextTopLoader from "nextjs-toploader";
import "@blocknote/mantine/style.css";
import "@blocknote/xl-ai/style.css";
import "@blocknote/react/style.css";
import { Barlow } from "next/font/google";
import "@/styles/styles.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: "AI Architect Project",
  description: "Generate Your Idea Project",
  icons: {
    icon: "/metalhade.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body className={barlow.className}>
        <NextTopLoader
          color="#2f2f2fff"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary))"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          <LayoutWrapper>
            <ClientOnly>{children}</ClientOnly>
          </LayoutWrapper>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
