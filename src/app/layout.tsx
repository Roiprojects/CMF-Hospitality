import type { Metadata, Viewport } from 'next';
import Shell from '@/components/Shell';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Bar Chef Bengaluru — Experience, Not Just Beverage.',
    template: '%s | Bar Chef Bengaluru'
  },
  description: 'Personalised bar experiences for weddings, private celebrations and live events.',
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Bar Chef'
  }
};

export const viewport: Viewport = {
  themeColor: '#091011',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
