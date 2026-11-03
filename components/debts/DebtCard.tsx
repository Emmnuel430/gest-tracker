'use client';

import React, { useState, useTransition } from 'react';
import {
  Calendar,
  Trash2,
  Pencil,
  CheckCircle,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  History,
  Wallet,
} from 'lucide-react';
import { formatCurrency } from '@/constants/config';
import { DebtItem, deleteDebtAction } from '@/actions/debts';
import { isDebtOverdue } from '@/lib/debts';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface DebtCardProps {
  debt: DebtItem;
  onRepay: (debt: DebtItem) => void;
  onEdit: (debt: DebtItem) => void;
  onRefresh: () => void;
}

export function DebtCard({ debt, onRepay, onEdit, onRefresh }: DebtCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRepayments, setShowRepayments] = useState(false);

  const isLent = debt.type === 'LENT';
  const isSettled = debt.status === 'SETTLED';
  const isOverdue = isDebtOverdue(debt);
  const repayments = debt.repayments || [];

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
  const progressPercent =
    debt.initialAmount > 0 ? Math.round((repaidAmount / debt.initialAmount) * 100) : 0;

  const formatReadableDate = (isoDate: string) => {
    const [y, m, d] = isoDate.split('T')[0].split('-').map(Number);
    if (!y || !m || !d) return isoDate;
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`p-4 rounded-2xl border-3 transition-all ${
        isSettled
          ? 'bg-neutral-50 dark:bg-[#0F172A]/40 border-neutral-300 dark:border-neutral-700 opacity-75'
          : isOverdue
            ? 'bg-white dark:bg-[#1E293B] border-[#DC2626] dark:border-[#EF4444] shadow-[4px_4px_0px_0px_#DC2626]'
            : 'bg-white dark:bg-[#1E293B] border-[#111827] dark:border-[#334155] shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000]'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-black text-sm text-[#111827] dark:text-[#F8FAFC] truncate">
              {debt.personName}
            </h4>
            <span
              className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded border border-[#111827] flex items-center gap-0.5 ${
                isLent ? 'bg-[#00DF81] text-[#111827]' : 'bg-[#FF3366] text-white'
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
            {debt.walletName && (
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded border border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-[#0F172A] text-neutral-700 dark:text-neutral-300 inline-flex items-center gap-0.5">
                <Wallet className="w-2.5 h-2.5" />
                {debt.walletName}
              </span>
            )}
          </div>
          {debt.note && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium italic mt-0.5 break-words">
              « {debt.note} »
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(debt)}
            disabled={isPending}
            title="Modifier ce dossier"
            aria-label={`Modifier le dossier de ${debt.personName}`}
            className="p-1 rounded-lg border border-[#111827] bg-neutral-100 dark:bg-[#131C31] hover:bg-[#FFE600] hover:text-[#111827] text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 stroke-2.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isPending}
            title="Supprimer ce dossier"
            aria-label={`Supprimer le dossier de ${debt.personName}`}
            className="p-1 rounded-lg border border-[#111827] bg-neutral-100 dark:bg-[#131C31] hover:bg-red-500 hover:text-white text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-2.5" />
          </button>
        </div>
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

      {/* Échéance & Statut (avec badge En retard si échéance dépassée - [DEBT-05]) */}
      <div className="flex items-center justify-between gap-2 text-[11px] font-bold pt-2 border-t border-neutral-100 dark:border-[#334155]">
        <div
          className={`flex items-center gap-1 ${
            isOverdue
              ? 'text-[#DC2626] dark:text-[#FCA5A5] font-black'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <Calendar className="w-3 h-3 shrink-0" />
          <span>
            {debt.dueDate
              ? `Échéance : ${formatReadableDate(debt.dueDate)}`
              : 'Sans date limite'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isOverdue && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase border border-[#111827] bg-[#FEE2E2] text-[#991B1B]">
              <AlertTriangle className="w-2.5 h-2.5 stroke-2.5" />
              En retard
            </span>
          )}
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
      </div>

      {/* Historique pliable des remboursements ([DEBT-03]) */}
      {repayments.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-dashed border-neutral-200 dark:border-[#334155]">
          <button
            type="button"
            onClick={() => setShowRepayments((prev) => !prev)}
            className="w-full flex items-center justify-between text-[10px] font-black uppercase text-neutral-600 dark:text-neutral-300 hover:text-[#111827] dark:hover:text-white cursor-pointer"
          >
            <span className="inline-flex items-center gap-1">
              <History className="w-3 h-3" />
              Historique des versements ({repayments.length})
            </span>
            {showRepayments ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showRepayments && (
            <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {repayments.map((rep) => (
                <div
                  key={rep.id}
                  className="p-2 rounded-lg bg-neutral-100 dark:bg-[#0F172A] border border-neutral-300 dark:border-[#334155] text-[10px] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="font-black text-[#111827] dark:text-[#F8FAFC] block">
                      {formatCurrency(rep.amount)}
                    </span>
                    {rep.note && (
                      <span className="text-neutral-500 dark:text-neutral-400 italic truncate block">
                        {rep.note}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0 text-neutral-500 dark:text-neutral-400 font-bold">
                    <span className="block">{formatReadableDate(rep.paidAt)}</span>
                    {rep.walletName && (
                      <span className="text-[9px] uppercase text-[#2563EB] dark:text-[#60A5FA]">
                        {rep.walletName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
