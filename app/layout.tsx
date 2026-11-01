import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CitarumAlert - Pantau Banjir & Siaga Warga Kab. Bandung',
  description:
    'Platform live public dashboard & crowdsourcing tanggap banjir Kabupaten Bandung menggabungkan sensor sungai resmi (AWLR BBWS/BPBD) dan laporan warga terverifikasi.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
