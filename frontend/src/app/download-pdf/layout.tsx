'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const isParentMode = searchParams.get('student') !== null;

  // Parent mode - no sidebar, just content
  if (isParentMode) {
    return <div className="w-full">{children}</div>;
  }

  // Admin mode - redirect to laporan page (admin shouldn't use this page directly)
  if (typeof window !== 'undefined') {
    window.location.href = '/laporan/bulanan';
  }

  return <div className="w-full">{children}</div>;
}

export default function DownloadPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="w-full">{children}</div>}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}
