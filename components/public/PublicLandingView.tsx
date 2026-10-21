'use client';

import React from 'react';
import Link from 'next/link';
import {
  Play,
  ArrowRight,
  ShieldCheck,
  Wallet,
  ArrowRightLeft,
  PieChart,
  Tag,
  Zap,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Banknote,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

export function PublicLandingView() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#111827] dark:text-[#F8FAFC] transition-colors">
      <PublicHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-16 space-y-16 sm:space-y-24">
        {/* ========================================================================= */}
        {/* HERO SECTION                                                             */}
        {/* ========================================================================= */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-4">
          {/* Badge Néobrutaliste */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE600] text-[#111827] border-2 border-[#111827] shadow-[3px_3px_0px_0px_#111827] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 stroke-[3]" />
            <span>Gestion financière personnelle en Afrique de l&apos;Ouest</span>
          </div>

          {/* Titre Principal */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC] leading-[1.1]">
            Reprenez le contrôle total de vos finances.
          </h1>

          {/* Sous-titre */}
          <p className="text-sm sm:text-lg font-semibold text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto">
            Suivez vos <span className="text-[#10B981] font-bold">espèces</span>, vos comptes <span className="text-[#1DC4F2] font-bold">Wave</span>, <span className="text-[#FF7900] font-bold">Orange Money</span> et vos comptes <span className="text-[#2563EB] font-bold">bancaires</span> en un clin d&apos;œil. Sans tableurs complexes, avec une simplicité radicale.
          </p>

          {/* Double CTA Principal */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link href="/demo" className="w-full sm:w-auto">
              <Button
                variant="warning"
                size="lg"
                fullWidth
                className="text-sm uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] px-6 py-3.5"
              >
                <Play className="w-4 h-4 stroke-[3] fill-current" />
                <span>Essayer la démo interactive</span>
              </Button>
            </Link>

            <Link href="/register" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="text-sm uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] px-6 py-3.5 bg-[#10B981] hover:bg-[#059669] text-white"
              >
                <span>Créer un compte gratuit</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Button>
            </Link>
          </div>

          {/* Micro-preuves de réassurance */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              Démo immédiate sans inscription
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              Zéro synchronisation bancaire intrusive
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              Multi-portefeuilles en FCFA
            </span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* DÉMO INTERACTIVE TEASER BANNER                                            */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#111827] dark:shadow-[8px_8px_0px_0px_#000000] space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#DBEAFE] dark:bg-[#1E3A8A] text-[#1D4ED8] dark:text-[#93C5FD] border border-[#111827] dark:border-[#334155] text-xs font-black uppercase">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Mode Découverte Directe</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
                Explorez l&apos;application en direct sans créer de compte.
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Naviguez dans un tableau de bord fictif, filtrez l&apos;historique par période, consultez la répartition par catégorie et observez le suivi en temps réel de 4 comptes réalistes (Espèces, Wave, Orange Money, Banque).
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <Link href="/demo">
                <Button
                  variant="warning"
                  size="lg"
                  className="w-full md:w-auto text-xs sm:text-sm uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#111827]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Lancer la démo en 1 clic</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mini-aperçu visuel de données démo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t-2 border-neutral-100 dark:border-neutral-800">
            <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl">
              <span className="text-[10px] font-black uppercase text-neutral-500 block">Solde consolidé</span>
              <span className="text-base sm:text-lg font-black text-[#2563EB] dark:text-[#60A5FA]">650 000 FCFA</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl">
              <span className="text-[10px] font-black uppercase text-neutral-500 block">Wave disponible</span>
              <span className="text-base sm:text-lg font-black text-[#1DC4F2]">210 000 FCFA</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl">
              <span className="text-[10px] font-black uppercase text-neutral-500 block">Orange Money</span>
              <span className="text-base sm:text-lg font-black text-[#FF7900]">155 000 FCFA</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border-2 border-[#111827] dark:border-[#334155] rounded-xl">
              <span className="text-[10px] font-black uppercase text-neutral-500 block">Espèces physiques</span>
              <span className="text-base sm:text-lg font-black text-[#52B788]">85 000 FCFA</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* LES 4 PILIERS DU PRODUIT                                                 */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
              Conçu pour votre réalité financière
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400">
              Des fonctionnalités taillées pour le quotidien, sans jargon ni complexité inutile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pilier 1 : Multi-comptes */}
            <div className="p-6 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[5px_5px_0px_0px_#111827] dark:shadow-[5px_5px_0px_0px_#000000] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#DBEAFE] text-[#2563EB] border-2 border-[#111827] dark:border-[#334155] flex items-center justify-center shadow-[2px_2px_0px_0px_#111827]">
                <Wallet className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                Trésorerie Multi-Comptes Réelle
              </h3>
              <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Suivez simultanément vos espèces en poche, vos soldes Wave et Orange Money, ainsi que vos comptes bancaires. Consultez votre patrimoine net en un coup d&apos;œil.
              </p>
              <div className="pt-1 flex items-center gap-2 text-xs font-bold text-neutral-500">
                <Banknote className="w-4 h-4 text-[#52B788]" />
                <Smartphone className="w-4 h-4 text-[#1DC4F2]" />
                <CreditCard className="w-4 h-4 text-[#2563EB]" />
                <span>Tous vos canaux réunis</span>
              </div>
            </div>

            {/* Pilier 2 : Trilogie Financière */}
            <div className="p-6 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[5px_5px_0px_0px_#111827] dark:shadow-[5px_5px_0px_0px_#000000] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#16A34A] border-2 border-[#111827] dark:border-[#334155] flex items-center justify-center shadow-[2px_2px_0px_0px_#111827]">
                <ArrowRightLeft className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                Trilogie Financière 2+1
              </h3>
              <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Saisissez un revenu (Entrant), une dépense (Sortant) ou un virement entre vos comptes en moins de 5 secondes. Les frais de virement sont calculés et enregistrés automatiquement.
              </p>
              <div className="pt-1 text-xs font-bold text-neutral-500">
                Neutralité mathématique garantie sur les transferts internes.
              </div>
            </div>

            {/* Pilier 3 : Catégories & Enveloppes */}
            <div className="p-6 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[5px_5px_0px_0px_#111827] dark:shadow-[5px_5px_0px_0px_#000000] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] text-[#D97706] border-2 border-[#111827] dark:border-[#334155] flex items-center justify-center shadow-[2px_2px_0px_0px_#111827]">
                <Tag className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                Catégories & Enveloppes Claires
              </h3>
              <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Organisez vos rentrées et vos sorties dans des catégories sur-mesure dotées de codes couleur distinctifs. Définissez vos plafonds budgétaires mensuels.
              </p>
              <div className="pt-1 text-xs font-bold text-neutral-500">
                Contrôle préventif de surconsommation budgétaire.
              </div>
            </div>

            {/* Pilier 4 : Sécurité & Cloisonnement */}
            <div className="p-6 bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[5px_5px_0px_0px_#111827] dark:shadow-[5px_5px_0px_0px_#000000] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FEE2E2] text-[#DC2626] border-2 border-[#111827] dark:border-[#334155] flex items-center justify-center shadow-[2px_2px_0px_0px_#111827]">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                Cloisonnement & Confidentialité Totale
              </h3>
              <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Vos finances vous appartiennent exclusivement. Chaque donnée est isolée côté base de données PostgreSQL via Row-Level Security. Zéro tracking commercial.
              </p>
              <div className="pt-1 text-xs font-bold text-neutral-500">
                Session chiffrée SSL & authentification sécurisée.
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BANNIÈRE DE CONVERSION FINALE                                             */}
        {/* ========================================================================= */}
        <section className="bg-[#111827] text-white border-3 border-[#111827] dark:border-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-[8px_8px_0px_0px_#FFE600]">
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Prêt à reprendre la main sur votre argent ?
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-300 leading-relaxed">
              Commencez par tester la démo interactive sans engagement, ou créez votre compte gratuit en 30 secondes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/demo" className="w-full sm:w-auto">
              <Button
                variant="warning"
                size="lg"
                fullWidth
                className="text-xs sm:text-sm uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000000]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Tester la démo</span>
              </Button>
            </Link>

            <Link href="/register" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="text-xs sm:text-sm uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000000] bg-[#10B981] hover:bg-[#059669] text-white"
              >
                <span>Créer mon compte gratuit</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
