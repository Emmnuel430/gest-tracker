'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, ShieldAlert, LogOut, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { signOutAction } from '@/actions/auth-session';

const IDLE_WARNING_MS = 14 * 60 * 1000; // 14 minutes
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const PING_THROTTLE_MS = 60 * 1000; // 1 minute

export function SessionTimeoutWatcher() {
  const router = useRouter();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const lastActivityRef = useRef<number>(0);
  const lastPingRef = useRef<number>(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Ping du serveur pour rafraîchir l'inactivité glissante
  const pingServer = useCallback(async () => {
    try {
      lastPingRef.current = Date.now();
      const res = await fetch('/api/session/activity', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === 'EXPIRED_IDLE') {
          router.push('/login?reason=idle');
        } else if (data.error === 'EXPIRED_MAX_AGE') {
          router.push('/login?reason=expired');
        }
      }
    } catch {
      // Ignorer les erreurs réseau temporaires
    }
  }, [router]);

  // Réinitialisation de l'inactivité locale
  const resetTimer = useCallback(
    (notifyOtherTabs = true) => {
      lastActivityRef.current = Date.now();

      if (showWarningModal) {
        setShowWarningModal(false);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }

      // Ping vers le serveur si plus d'une minute s'est écoulée
      if (Date.now() - lastPingRef.current >= PING_THROTTLE_MS) {
        pingServer();
      }

      // Synchronisation avec les autres onglets
      if (notifyOtherTabs && channelRef.current) {
        try {
          channelRef.current.postMessage({ type: 'activity', timestamp: Date.now() });
        } catch {
          // Erreur silencieuse si le canal est fermé
        }
      }
    },
    [showWarningModal, pingServer]
  );

  // Déconnexion manuelle ou forcée
  const handleLogout = useCallback(
    async (reason: 'idle' | 'manual' = 'manual') => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      setShowWarningModal(false);

      if (channelRef.current) {
        try {
          channelRef.current.postMessage({ type: 'logout' });
        } catch {
          // Ignorer
        }
      }

      await signOutAction();
      router.push(`/login?reason=${reason === 'idle' ? 'idle' : ''}`);
      router.refresh();
    },
    [router]
  );

  // Initialisation du canal BroadcastChannel et des écouteurs d'événements
  useEffect(() => {
    if (typeof window === 'undefined') return;

    lastActivityRef.current = Date.now();
    lastPingRef.current = Date.now();

    try {
      const channel = new BroadcastChannel('gt-session');
      channelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === 'activity') {
          resetTimer(false);
        } else if (event.data?.type === 'logout') {
          router.push('/login?reason=idle');
        }
      };
    } catch {
      // BroadcastChannel non supporté sur ce navigateur
    }

    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    const handleUserInteraction = () => {
      // Éviter de réinitialiser pendant que la modale d'alerte des 60s est active sans clic explicite
      if (!showWarningModal) {
        resetTimer(true);
      }
    };

    events.forEach((ev) => {
      window.addEventListener(ev, handleUserInteraction, { passive: true });
    });

    // Surveillance régulière de l'inactivité (toutes les 5 secondes)
    const checkInterval = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;

      if (idleTime >= IDLE_TIMEOUT_MS) {
        // Expiration définitive des 15 minutes
        handleLogout('idle');
      } else if (idleTime >= IDLE_WARNING_MS && !showWarningModal) {
        // Déclenchement de l'alerte à 14 minutes
        setShowWarningModal(true);
        const remaining = Math.max(0, Math.ceil((IDLE_TIMEOUT_MS - idleTime) / 1000));
        setSecondsRemaining(remaining);
      }
    }, 5000);

    return () => {
      events.forEach((ev) => {
        window.removeEventListener(ev, handleUserInteraction);
      });
      clearInterval(checkInterval);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [resetTimer, handleLogout, showWarningModal, router]);

  // Compte à rebours seconde par seconde lorsque la modale est affichée
  useEffect(() => {
    if (showWarningModal) {
      countdownIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            handleLogout('idle');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [showWarningModal, handleLogout]);

  if (!showWarningModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-6 shadow-[8px_8px_0px_0px_#111827] dark:shadow-[8px_8px_0px_0px_#000000] text-center">
        <div className="w-14 h-14 bg-[#FEF3C7] dark:bg-[#78350F] border-3 border-[#111827] dark:border-[#334155] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]">
          <Clock className="w-7 h-7 text-[#D97706] dark:text-[#FDE68A] stroke-3 animate-pulse" />
        </div>

        <h2 className="text-xl font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
          Session Inactive
        </h2>

        <p className="text-xs font-bold text-neutral-600 dark:text-neutral-300 mt-2">
          Vous êtes inactif depuis 14 minutes. Par mesure de sécurité, vous serez déconnecté dans :
        </p>

        <div className="my-4 py-2 px-4 inline-block bg-[#FEF2F2] dark:bg-[#450A0A] border-2 border-[#DC2626] rounded-xl text-2xl font-black text-[#DC2626] dark:text-[#FCA5A5] shadow-[2px_2px_0px_0px_#DC2626]">
          {secondsRemaining}s
        </div>

        <div className="flex flex-col gap-2.5 mt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              resetTimer(true);
              pingServer();
            }}
            className="flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Rester Connecté</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => handleLogout('idle')}
            className="flex items-center justify-center gap-1.5 text-neutral-600 dark:text-neutral-400"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Se déconnecter maintenant</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
