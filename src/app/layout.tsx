import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { PhoneFrame } from '@/components/ui/PhoneFrame';
import '@/styles/globals.css';

// Placeholder typeface — Kamsi picks the real one in K0 (keep the --font-body variable name).
const body = Inter({ variable: '--font-body', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Homatch',
  description: 'Swipe-to-match for renting in Ireland.',
  appleWebApp: { capable: true, title: 'Homatch', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#faf8f5',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IE" className={body.variable}>
      <body>
        <PhoneFrame>{children}</PhoneFrame>
      </body>
    </html>
  );
}
