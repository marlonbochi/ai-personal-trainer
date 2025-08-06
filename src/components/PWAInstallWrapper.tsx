'use client';

import dynamic from 'next/dynamic';

// Dynamically import the PWAInstallPrompt component with SSR disabled
const PWAInstallPrompt = dynamic(
  () => import('@/components/PWAInstallPrompt'),
  { ssr: false }
);

export default function PWAInstallWrapper() {
  return <PWAInstallPrompt />;
}
