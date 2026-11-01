import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Citarum Alert - Pemantauan banjir & siaga warga Kab. Bandung',
  description:
    'Telemetri Sensor Sungai Resmi (AWLR BBWS / BPBD) & Crowdsourcing Siaga Warga Kabupaten Bandung.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Source+Sans+3:ital,wght@0,300..900;1,300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f5f6f5] text-[#173744] font-sans antialiased selection:bg-[#126b70] selection:text-white">
        {children}
      </body>
    </html>
  );
}
