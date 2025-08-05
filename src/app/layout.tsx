import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import ProvidersWrapper from "./ProvidersWrapper";
import FontStyles from "./FontStyles";

export const metadata: Metadata = {
  title: "AI Personal Trainer",
  description: "Your personal AI workout assistant",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <FontStyles />
        <Providers>
          <ProvidersWrapper>
            {children}
          </ProvidersWrapper>
        </Providers>
      </body>
    </html>
  );
}
