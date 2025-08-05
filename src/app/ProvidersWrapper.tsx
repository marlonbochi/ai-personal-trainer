'use client';

import { useEffect, useState } from 'react';
import { Analytics } from "@vercel/analytics/react";

export default function ProvidersWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      <Analytics />
    </>
  );
}
