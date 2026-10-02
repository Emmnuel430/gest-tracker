import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { HeaderAuth } from '@/components/layout/HeaderAuth';

export const metadata: Metadata = {
  title: 'GEST TRACKER — Suivi des dépenses & revenus',
  description: 'Application personnelle de suivi financier en Néobrutalisme',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#111827]">
        <header className="w-full border-b-3 border-[#111827] bg-[#2563EB] py-3.5 px-4 shadow-[0_3px_0_0_#111827]">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-8 h-8 bg-[#111827] text-white font-black text-lg flex items-center justify-center rounded-lg border-2 border-white shadow-[2px_2px_0px_0px_#111827] group-hover:-rotate-3 transition-transform">
                G
              </span>
              <span className="font-black text-lg sm:text-xl uppercase tracking-tighter text-white">
                GEST TRACKER
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase px-2.5 py-1 bg-[#DBEAFE] text-[#111827] border-2 border-[#111827] rounded-md shadow-[2px_2px_0px_0px_#111827]">
                FCFA
              </span>
              <HeaderAuth />
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-xl mx-auto px-4 py-6 sm:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
