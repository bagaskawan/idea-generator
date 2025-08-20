import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from "@/components/ui/sonner";
import ClientOnly from "@/components/root/ClientOnly";

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
      <body className="font-sans antialiased">
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
