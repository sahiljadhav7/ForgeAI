import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

// The variable class goes on <html>: globals.css defines --font-sans from
// --font-inter on :root, which only resolves if --font-inter is set there.
const inter = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "block",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "%s · Daybreak",
    default: "Daybreak",
  },
  description: "Daybreak turns a written description into a working React app.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <body className="daybreak font-sans">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            {children}

            <Toaster richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
