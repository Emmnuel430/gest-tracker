'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Shield,
  Download,
  FileJson,
  FileSpreadsheet,
  Printer,
  Trash2,
  AlertTriangle,
  Clock,
  Database,
} from 'lucide-react';
import { getUserProfileAction, deleteAccountAction } from '@/actions/user';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDisplayDate } from '@/lib/dates';

export default function ParametresPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [profile, setProfile] = useState<{
    id: string;
    email: string;
    createdAt: string;
    transactionCount: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  useEffect(() => {
    getUserProfileAction().then((res) => {
      setLoading(false);
      if (res.success) {
        setProfile(res.data);
      } else {
        setErrorMessage(res.error);
      }
    });
  }, []);

  const handleDeleteAccount = async () => {
    setDeletePending(true);
    startTransition(async () => {
      const res = await deleteAccountAction();
      setDeletePending(false);
      setShowDeleteConfirm(false);

      if (res.success) {
        router.push('/login');
        router.refresh();
      } else {
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-8">
      {/* En-tête avec bouton retour */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC] hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 stroke-3" />
          <span>Tableau de bord</span>
        </Link>
        <span className="text-[11px] font-black uppercase px-2.5 py-1 bg-[#F3F4F6] dark:bg-[#1E293B] text-[#111827] dark:text-[#F8FAFC] border-2 border-[#111827] dark:border-[#334155] rounded-md shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]">
          Paramètres & Compte
        </span>
      </div>

      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
          Paramètres du Compte
        </h1>
        <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1">
          Gestion de votre espace privé, sauvegarde intégrale et souveraineté des données
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-[#FEF2F2] dark:bg-[#2C0B0E] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] text-xs font-bold text-[#DC2626]">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* 1. Carte Profil & Métadonnées */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-neutral-200 dark:border-[#334155]">
          <div className="w-10 h-10 bg-[#2563EB] text-white border-2 border-[#111827] dark:border-white rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#111827]">
            <User className="w-5 h-5 stroke-3" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-[#111827] dark:text-[#F8FAFC]">
              Identité de session
            </h2>
            <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              Espace clos et chiffré Supabase
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-4 text-center text-xs font-bold text-neutral-500 animate-pulse">
            Chargement des informations du profil...
          </div>
        ) : profile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#111827] dark:border-[#334155] rounded-lg">
              <span className="font-bold text-neutral-600 dark:text-neutral-400">Email :</span>
              <span className="font-black text-[#111827] dark:text-[#F8FAFC] truncate max-w-[220px]">
                {profile.email}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#111827] dark:border-[#334155] rounded-lg">
              <span className="font-bold text-neutral-600 dark:text-neutral-400">Opérations enregistrées :</span>
              <span className="font-black px-2 py-0.5 bg-[#DCFCE7] dark:bg-[#064E3B] text-[#16A34A] dark:text-[#86EFAC] rounded border border-[#111827] dark:border-transparent text-[11px]">
                {profile.transactionCount} transactions
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#111827] dark:border-[#334155] rounded-lg">
              <span className="font-bold text-neutral-600 dark:text-neutral-400">Date d'inscription :</span>
              <span className="font-bold text-[#111827] dark:text-[#F8FAFC]">
                {formatDisplayDate(profile.createdAt, 'dd MMMM yyyy')}
              </span>
            </div>
          </div>
        ) : null}
      </Card>

      {/* 2. Carte Sauvegarde & Exportation Complète */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-neutral-200 dark:border-[#334155]">
          <div className="w-10 h-10 bg-[#10B981] text-white border-2 border-[#111827] dark:border-white rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#111827]">
            <Download className="w-5 h-5 stroke-3" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-[#111827] dark:text-[#F8FAFC]">
              Sauvegarde & Export Intégral
            </h2>
            <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              Téléchargez l'intégralité de vos opérations financières
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Export JSON (Backup souverain) */}
          <a
            href="/api/user/export"
            download
            className="w-full flex items-center justify-between p-3.5 bg-[#ECFDF5] dark:bg-[#064E3B]/40 hover:bg-[#D1FAE5] dark:hover:bg-[#064E3B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="flex items-center gap-2.5">
              <FileJson className="w-5 h-5 text-[#059669] stroke-3" />
              <div className="text-left">
                <span className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                  Sauvegarde Complète (JSON)
                </span>
                <span className="block text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                  Format standard avec métadonnées de dates et devises
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-[#059669]">⬇ JSON</span>
          </a>

          {/* Export CSV (Excel) */}
          <a
            href="/api/export/csv?period=year"
            download
            className="w-full flex items-center justify-between p-3.5 bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 hover:bg-[#DBEAFE] dark:hover:bg-[#1E3A8A] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-[#2563EB] stroke-3" />
              <div className="text-left">
                <span className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                  Tableur Excel / CSV (Année)
                </span>
                <span className="block text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                  Encodage UTF-8 avec séparateurs point-virgule
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-[#2563EB]">⬇ CSV</span>
          </a>

          {/* Export PDF */}
          <a
            href="/api/export/pdf?period=month"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-3.5 bg-[#FFFBEB] dark:bg-[#78350F]/40 hover:bg-[#FEF3C7] dark:hover:bg-[#78350F] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="flex items-center gap-2.5">
              <Printer className="w-5 h-5 text-[#D97706] stroke-3" />
              <div className="text-left">
                <span className="block text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                  Rapport Imprimable (PDF A4)
                </span>
                <span className="block text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                  Mise en page haute fidélité pour impression
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-[#D97706]">📄 Imprimer</span>
          </a>
        </div>
      </Card>

      {/* 3. Carte Zone de Danger — Droit à l'oubli / Suppression de Compte */}
      <div className="bg-[#FEF2F2] dark:bg-[#2C0B0E] border-3 border-[#111827] dark:border-[#334155] rounded-2xl p-5 shadow-[5px_5px_0px_0px_#111827] dark:shadow-[5px_5px_0px_0px_#000000]">
        <div className="flex items-center gap-3 mb-3 pb-3 border-b-2 border-[#FECACA] dark:border-[#7F1D1D]">
          <div className="w-10 h-10 bg-[#DC2626] text-white border-2 border-[#111827] rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#111827]">
            <AlertTriangle className="w-5 h-5 stroke-3 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-[#DC2626] dark:text-[#F87171]">
              Zone de Danger — Suppression du Compte
            </h2>
            <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
              Droit à l'oubli et effacement définitif (RGPD)
            </p>
          </div>
        </div>

        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
          La suppression de votre compte effacera immédiatement et irréversiblement l'ensemble de vos transactions, catégories et soldes enregistrés sur Personal GEST TRACKER. Cette action est irréversible.
        </p>

        <Button
          type="button"
          variant="danger"
          size="md"
          fullWidth
          disabled={deletePending || isPending}
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Supprimer définitivement mon compte et mes données</span>
        </Button>
      </div>

      {/* Boîte de confirmation de suppression */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Supprimer définitivement votre compte ?"
        message="Êtes-vous absolument sûr ? Toutes vos dépenses, vos revenus et vos historiques seront purgés sans possibilité de récupération."
        confirmLabel="Oui, purger mon compte"
        cancelLabel="Annuler"
        isLoading={deletePending}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
