import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tradex | Advanced Fleet & User Management",
  description: "Enterprise-grade dashboard for managing automotive assets and team performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
        <Toaster position="top-right" expand={false} richColors />
        
        {/* Hydration bait for browser extensions (Google Dictionary/Translate) */}
        <div 
          id="pronounceRootElement" 
          className="pronounceRootElementItem"
          style={{ position: "fixed", top: "0px", left: "0px", width: "1px", height: "1px", zIndex: 2147483645 }}
          hidden={true}
          suppressHydrationWarning 
        />
      </body>
    </html>
  );
}
