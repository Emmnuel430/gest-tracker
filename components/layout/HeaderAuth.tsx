'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, User } from 'lucide-react';

export function HeaderAuth() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Ne pas afficher sur la page login
  if (pathname === '/login') {
    return null;
  }

  if (!userEmail) {
    return (
      <a
        href="/login"
        className="text-[11px] font-black uppercase px-2 py-1 bg-white border-2 border-black rounded-md shadow-[2px_2px_0px_0px_#000] hover:bg-neutral-100 flex items-center gap-1"
      >
        <User className="w-3.5 h-3.5" />
        <span>Connexion</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      title="Se déconnecter"
      className="text-[11px] font-black uppercase px-2 py-1 bg-[#FFEAEB] hover:bg-[#FF3847] hover:text-white border-2 border-black rounded-md shadow-[2px_2px_0px_0px_#000] transition-colors flex items-center gap-1 cursor-pointer"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Quitter</span>
    </button>
  );
}
