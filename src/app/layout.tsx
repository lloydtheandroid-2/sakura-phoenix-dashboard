// File: src/app/layout.tsx
import { AuthProvider } from '../contexts/AuthContext';
import { AuthInitializer } from '../components/AuthInitializer';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sakura Phoenix Dashboard",
  description: "Dashboard for managing Sakura Phoenix applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AuthInitializer>
            {children}
          </AuthInitializer>
        </AuthProvider>
      </body>
    </html>
  );
}
