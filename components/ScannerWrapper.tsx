'use client';

import dynamic from 'next/dynamic';

const Scanner = dynamic(() => import('@/components/Scanner'), { ssr: false });

export default function ScannerWrapper(props: any) {
  return <Scanner {...props} />;
}
