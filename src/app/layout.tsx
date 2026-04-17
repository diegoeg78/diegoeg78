import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ListingOS",
  description: "AI-powered listing toolkit for real estate agents",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}>
          <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6">
            <Link href="/" className="font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors">
              ListingOS
            </Link>
            <Link href="/listings"     className="text-sm text-gray-600 hover:text-gray-900">Listings</Link>
            <Link href="/photos"       className="text-sm text-gray-600 hover:text-gray-900">Photo Branding</Link>
            <Link href="/settings"     className="text-sm text-gray-600 hover:text-gray-900">Settings</Link>
            <div className="ml-auto">
              <UserButton />
            </div>
          </nav>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
