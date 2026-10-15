'use client';

import React, { useState, useTransition } from 'react';
import { Calendar, Trash2, CheckCircle, Clock, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/constants/config';
import { DebtItem, deleteDebtAction } from '@/actions/debts';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface DebtCardProps {
  debt: DebtItem;
  onRepay: (debt: DebtItem) => void;
  onRefresh: () => void;
}

export function DebtCard({ debt, onRepay, onRefresh }: DebtCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isLent = debt.type === 'LENT';
  const isSettled = debt.status === 'SETTLED';

  const confirmDelete = () => {
    startTransition(async () => {
      const res = await deleteDebtAction(debt.id);
      if (res.success) {
        setShowDeleteConfirm(false);
        onRefresh();
      }
    });
  };

  const repaidAmount = debt.initialAmount - debt.remainingAmount;
  const progressPercent = debt.initialAmount > 0
    ? Math.round((repaidAmount / debt.initialAmount) * 100)
    : 0;

  return (
    <div
      className={`p-4 rounded-2xl border-3 transition-all ${
        isSettled
          ? 'bg-neutral-50 dark:bg-[#0F172A]/40 border-neutral-300 dark:border-neutral-700 opacity-75'
          : 'bg-white dark:bg-[#1E293B] border-[#111827] dark:border-[#334155] shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000]'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-black text-sm text-[#111827] dark:text-[#F8FAFC]">
              {debt.personName}
            </h4>
            <span
              className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded border border-[#111827] flex items-center gap-0.5 ${
                isLent
                  ? 'bg-[#00DF81] text-[#111827]'
                  : 'bg-[#FF3366] text-white'
              }`}
            >
              {isLent ? (
                <>
                  <ArrowDownLeft className="w-2.5 h-2.5 stroke-3" />
                  On me doit
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-2.5 h-2.5 stroke-3" />
                  Je dois
                </>
              )}
            </span>
          </div>
          {debt.note && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium italic mt-0.5">
              « {debt.note} »
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isPending}
          title="Supprimer"
          className="p-1 rounded-lg border border-[#111827] bg-neutral-100 dark:bg-[#131C31] hover:bg-red-500 hover:text-white text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 stroke-2.5" />
        </button>
      </div>

      {/* Montants */}
      <div className="mb-3">
        <span className="text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400 block">
          {isSettled ? 'Montant intégralement soldé' : 'Reste à recouvrer / payer'}
        </span>
        <div
          className={`text-2xl font-black ${
            isSettled
              ? 'text-neutral-400 line-through'
              : isLent
              ? 'text-[#00DF81]'
              : 'text-[#FF3366]'
          }`}
        >
          {formatCurrency(debt.remainingAmount)}
        </div>
        <div className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mt-0.5">
          Montant initial : {formatCurrency(debt.initialAmount)}
        </div>
      </div>

      {/* Jauge de remboursement si partiel */}
      {debt.status === 'PARTIAL' && (
        <div className="mb-3 space-y-1">
          <div className="flex justify-between text-[10px] font-black uppercase text-neutral-500">
            <span>Remboursé : {formatCurrency(repaidAmount)}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-neutral-200 dark:bg-[#0F172A] border border-[#111827] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00DF81] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Échéance & Statut */}
      <div className="flex items-center justify-between text-[11px] font-bold pt-2 border-t border-neutral-100 dark:border-[#334155]">
        <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
          <Calendar className="w-3 h-3" />
          {debt.dueDate ? `Échéance : ${debt.dueDate}` : 'Sans date limite'}
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border border-[#111827] ${
            isSettled
              ? 'bg-[#DCFCE7] text-[#166534]'
              : debt.status === 'PARTIAL'
              ? 'bg-[#DBEAFE] text-[#1E40AF]'
              : 'bg-[#FEF3C7] text-[#92400E]'
          }`}
        >
          {isSettled ? 'Soldé' : debt.status === 'PARTIAL' ? 'Partiel' : 'En attente'}
        </span>
      </div>

      {/* Bouton de remboursement */}
      {!isSettled && (
        <button
          type="button"
          onClick={() => onRepay(debt)}
          className="w-full mt-3 py-2 px-3 bg-[#FFE600] hover:bg-yellow-300 text-[#111827] font-black text-xs uppercase rounded-xl border-2 border-[#111827] flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-[2px_2px_0px_0px_#111827]"
        >
          <CheckCircle className="w-3.5 h-3.5 stroke-2.5" />
          Enregistrer un remboursement
        </button>
      )}

      {/* Boîte de dialogue de confirmation de suppression */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Supprimer ce dossier de dette ?"
        message={`Êtes-vous certain de vouloir supprimer définitivement le dossier avec "${debt.personName}" (${formatCurrency(debt.initialAmount)}) ? Cette action supprimera également tous les remboursements enregistrés.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        isLoading={isPending}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
