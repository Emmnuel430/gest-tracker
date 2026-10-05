"use client";

import React, { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { formatCurrency } from "@/constants/config";
import { formatDisplayDate, formatTime } from "@/lib/dates";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EditTransactionModal } from "@/components/transactions/EditTransactionModal";
import { deleteTransactionAction } from "@/actions/transactions";
import { PAYMENT_METHOD_THEMES } from "@/constants/payment-methods";
import { CATEGORY_COLORS } from "@/constants/categories";

interface TransactionItemProps {
  transaction: Transaction;
  onDeleted?: (id: string) => void;
  onUpdated?: (updated: Transaction) => void;
}

export function TransactionItem({
  transaction,
  onDeleted,
  onUpdated,
}: TransactionItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const isIncome = transaction.type === "INCOME";
  const paymentTheme = PAYMENT_METHOD_THEMES[transaction.payment] || {
    bg: "#EFF6FF",
    text: "#111827",
  };
  const catColor = CATEGORY_COLORS[transaction.category] || "#2563EB";

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteTransactionAction(transaction.id);
    setIsDeleting(false);
    setShowConfirm(false);
    if (res.success && onDeleted) {
      onDeleted(transaction.id);
    }
  };

  const handleUpdated = (updated: Transaction) => {
    if (onUpdated) {
      onUpdated(updated);
    }
  };

  return (
    <>
      {/* Structure de Card Normalisée selon la Section 8 de roadmapv1.2.md */}
      <div className="bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl p-3.5 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between gap-3 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5">
        {/* Partie gauche : LOGO / Icône du type ou moyen de paiement */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-9 h-9 border-2 border-[#111827] dark:border-white rounded-lg flex items-center justify-center shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000] shrink-0 ${
              isIncome
                ? "bg-[#16A34A] text-white"
                : "bg-[#FEF2F2] dark:bg-[#2C0B0E] text-[#DC2626]"
            }`}
            title={`Moyen : ${transaction.payment}`}
          >
            {isIncome ? (
              <ArrowDownLeft className="w-5 h-5 stroke-3 text-white" />
            ) : (
              <ArrowUpRight className="w-5 h-5 stroke-3 text-[#DC2626]" />
            )}
          </div>

          {/* Informations : 3 lignes standardisées */}
          <div className="min-w-0 flex-1">
            {/* Ligne 1 : Catégorie · Moyen de paiement */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 font-black text-xs sm:text-sm text-[#111827] dark:text-[#F8FAFC]">
                <span
                  className="w-2 h-2 rounded-full border border-[#111827] dark:border-white shadow-[1px_1px_0px_0px_#111827]"
                  style={{ backgroundColor: catColor }}
                />
                {transaction.category}
              </span>
              <span className="text-neutral-400 dark:text-neutral-500 font-bold">
                ·
              </span>
              <span
                className="text-[10px] font-black px-1.5 py-0.5 border border-[#111827] dark:border-[#475569] rounded shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000]"
                style={{
                  backgroundColor: paymentTheme.bg,
                  color: paymentTheme.text,
                }}
              >
                {transaction.payment}
              </span>
            </div>

            {/* Ligne 2 : Date · Heure */}
            <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mt-0.5">
              {formatDisplayDate(transaction.date, "dd MMM yyyy")} ·{" "}
              {formatTime(transaction.date)}
            </p>

            {/* Ligne 3 : Note (limitée à une ligne avec line-clamp-1, non affichée si vide) */}
            {transaction.note && transaction.note.trim().length > 0 && (
              <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300 mt-0.5 line-clamp-1 italic">
                {transaction.note}
              </p>
            )}
          </div>
        </div>

        {/* Partie droite : Montant + Boutons empilés verticalement */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Montant coloré */}
          <span
            className={`font-black text-sm sm:text-base whitespace-nowrap ${
              isIncome ? "text-[#16A34A]" : "text-[#DC2626]"
            }`}
          >
            {isIncome ? "+" : "-"}{" "}
            {formatCurrency(Math.abs(Number(transaction.amount)))}
          </span>

          {/* Boutons d'actions empilés verticalement selon Section 8 */}
          <div className="flex flex-col gap-1 items-center">
            <button
              type="button"
              onClick={() => setShowEdit(true)}
              title="Modifier cette opération"
              className="p-1 text-neutral-500 dark:text-neutral-300 hover:text-[#2563EB] dark:hover:text-[#60A5FA] hover:bg-[#EFF6FF] dark:hover:bg-[#131C31] rounded-md transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              title="Supprimer cette opération"
              className="p-1 text-neutral-500 dark:text-neutral-300 hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#3B1214] rounded-md transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Boîte de dialogue de confirmation de suppression (Section 13) */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Supprimer cette opération ?"
        message="Cette action est irréversible. L'opération sera définitivement effacée de vos données."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />

      <EditTransactionModal
        transaction={transaction}
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onUpdated={handleUpdated}
      />
    </>
  );
}
