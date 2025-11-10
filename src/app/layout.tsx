import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "AI Personal Trainer",
  description: "Your personal AI workout assistant",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI Personal Trainer',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'AI Personal Trainer',
    title: 'AI Personal Trainer',
    description: 'Your personal AI workout assistant',
  },
  twitter: {
    card: 'summary',
    title: 'AI Personal Trainer',
    description: 'Your personal AI workout assistant',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientLayout>{children}</ClientLayout>;
}
