import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SpeedCheck | Internet Speed Test',
  description:
    'Test your internet connection speed. Measure download, upload, and ping with a modern browser-based speed test tool.',
  openGraph: {
    title: 'SpeedCheck | Internet Speed Test',
    description:
      'Test your internet connection speed. Measure download, upload, and ping instantly.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpeedCheck | Internet Speed Test',
    description:
      'Test your internet connection speed. Measure download, upload, and ping instantly.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#e2e8f0',
            },
          }}
        />
      </body>
    </html>
  );
}
