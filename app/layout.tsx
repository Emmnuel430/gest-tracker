import type { Metadata } from 'next';
import './globals.css';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import { BottomNav } from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'GEST TRACKER — Suivi des dépenses & revenus',
  description: 'Application personnelle de suivi financier en Néobrutalisme',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GEST TRACKER',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
                  var isDark = false;
                  if (stored === 'dark') {
                    isDark = true;
                  } else if (stored === 'light') {
                    isDark = false;
                  } else {
                    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  }
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#111827] dark:text-[#F8FAFC] transition-colors pb-24 sm:pb-28">
        <main className="flex-1 w-full max-w-xl mx-auto px-4 py-5 sm:py-6">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
