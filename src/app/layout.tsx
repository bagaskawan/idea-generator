import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from "@/components/ui/sonner";
import ClientOnly from "@/components/root/ClientOnly";
import NextTopLoader from "nextjs-toploader";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/react/style.css";

export const metadata: Metadata = {
  title: "Idea Generator",
  description: "Generate Your Idea Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fontsource/mona-sans@5.0.12/index.css"
        />
      </head>
      <body className="font-sans antialiased">
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
