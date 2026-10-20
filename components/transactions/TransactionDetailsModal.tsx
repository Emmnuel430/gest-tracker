"use client";

import React, { useState } from "react";
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  Tag,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Transaction } from "@/types/transaction";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EditTransactionModal } from "@/components/transactions/EditTransactionModal";
import { deleteTransactionAction, getLinkedTransferFeeAction } from "@/actions/transactions";
import {
  useCategories,
  useWallets,
} from "@/components/providers/ReferenceDataProvider";
import { formatCurrency } from "@/constants/config";
import { getContrastTextColor } from "@/lib/utils";

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: (id: string) => void;
  onUpdated?: (updated: Transaction) => void;
}

export function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
  onDeleted,
  onUpdated,
}: TransactionDetailsModalProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [linkedFee, setLinkedFee] = useState<Transaction | null>(null);

  const { categories, getCategoryColor } = useCategories();
  const { wallets, getWalletColor } = useWallets({ includeArchived: true, includeDeleted: true });

  // Récupérer les frais associés si l'opération est un virement
  React.useEffect(() => {
    if (isOpen && transaction && transaction.type === "TRANSFER") {
      getLinkedTransferFeeAction(transaction.id).then((res) => {
        if (res.success && res.data) {
          setLinkedFee(res.data);
        } else {
          setLinkedFee(null);
        }
      });
    } else {
      setLinkedFee(null);
    }
  }, [isOpen, transaction]);

  if (!transaction) return null;

  const isIncome = transaction.type === "INCOME";
  const isTransfer = transaction.type === "TRANSFER";
  const isExpense = transaction.type === "EXPENSE";
  const isTransferFee = !!transaction.linkedTransferId;

  // Recherche de la catégorie et de son statut archivé
  const catItem = categories.find(
    (c) => c.name.toLowerCase() === transaction.category.toLowerCase(),
  );
  const isCategoryArchived = catItem?.isArchived ?? false;
  const catColor = isTransfer
    ? "#2563EB"
    : getCategoryColor(transaction.category);

  // Recherche des portefeuilles source et cible
  const sourceWallet = wallets.find(
    (w) =>
      (transaction.walletId && w.id === transaction.walletId) ||
      w.name.toLowerCase() === transaction.payment.toLowerCase(),
  );
  const targetWallet = transaction.targetWalletId
    ? wallets.find((w) => w.id === transaction.targetWalletId)
    : null;

  const walletColor = getWalletColor(transaction.payment);
  const walletTextColor = getContrastTextColor(walletColor);

  // Formatage de la date complète en français
  let fullDateDisplay = transaction.date;
  try {
    const parsedDate = parseISO(transaction.date);
    fullDateDisplay = format(parsedDate, "EEEE dd MMMM yyyy 'à' HH:mm", {
      locale: fr,
    });
    // Mettre la première lettre en majuscule
    fullDateDisplay =
      fullDateDisplay.charAt(0).toUpperCase() + fullDateDisplay.slice(1);
  } catch {
    fullDateDisplay = transaction.date;
  }

  // Formatage des dates techniques createdAt et updatedAt
  const formatMetaDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const d = parseISO(dateStr);
      return format(d, "dd/MM/yyyy 'à' HH:mm", { locale: fr });
    } catch {
      return null;
    }
  };

  const createdDisplay = formatMetaDate(transaction.createdAt);
  const updatedDisplay =
    transaction.updatedAt && transaction.updatedAt !== transaction.createdAt
      ? formatMetaDate(transaction.updatedAt)
      : null;

  const typeTitle = isIncome
    ? "Entrée"
    : isTransfer
      ? "Virement interne"
      : isTransferFee
        ? "Frais de virement"
        : "Dépense";

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteTransactionAction(transaction.id);
      if (res.success) {
        setShowConfirmDelete(false);
        onClose();
        if (onDeleted) {
          onDeleted(transaction.id);
        }
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditUpdated = (updated: Transaction) => {
    setShowEdit(false);
    onClose();
    if (onUpdated) {
      onUpdated(updated);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showEdit}
        onClose={onClose}
        title="Détail de l'opération"
      >
        <div className="space-y-5">
          {/* 1. En-tête : Logo, Type et Montant en grand */}
          <div className="p-4 rounded-xl border-2 border-[#111827] dark:border-[#334155] bg-neutral-50 dark:bg-[#131C31] flex flex-col items-center text-center shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]">
            <div
              className={`w-12 h-12 border-2 border-[#111827] dark:border-white rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] mb-2.5 ${
                isIncome
                  ? "bg-[#16A34A] text-white"
                  : isTransfer
                    ? "bg-[#EFF6FF] dark:bg-[#1E3A8A] text-[#2563EB] dark:text-[#93C5FD]"
                    : "bg-[#FEF2F2] dark:bg-[#2C0B0E] text-[#DC2626]"
              }`}
            >
              {isIncome ? (
                <ArrowDownLeft className="w-6 h-6 stroke-3 text-white" />
              ) : isTransfer ? (
                <ArrowRightLeft className="w-6 h-6 stroke-3" />
              ) : (
                <ArrowUpRight className="w-6 h-6 stroke-3 text-[#DC2626]" />
              )}
            </div>

            <span className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {typeTitle}
            </span>

            <h3
              className={`text-2xl sm:text-3xl font-black mt-1 ${
                isIncome
                  ? "text-[#16A34A]"
                  : isTransfer
                    ? "text-[#111827] dark:text-[#F8FAFC]"
                    : "text-[#DC2626]"
              }`}
            >
              {isIncome ? "+ " : isTransfer ? "" : "- "}
              {formatCurrency(Math.abs(Number(transaction.amount)))}
            </h3>
          </div>

          {/* 2. Liste de détails structurée (<dl>) */}
          <dl className="space-y-3 text-xs sm:text-sm">
            {/* Catégorie */}
            <div className="flex items-start justify-between py-2 border-b border-neutral-200 dark:border-neutral-800">
              <dt className="font-bold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                Catégorie
              </dt>
              <dd className="font-black text-right flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-[#111827] dark:border-white shadow-[1px_1px_0px_0px_#111827] shrink-0"
                  style={{ backgroundColor: catColor }}
                />
                <span className="text-[#111827] dark:text-[#F8FAFC]">
                  {isTransfer ? "Virement interne" : transaction.category}
                </span>
                {isCategoryArchived && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-neutral-400 text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 ml-1">
                    archivée
                  </span>
                )}
              </dd>
            </div>

            {/* Portefeuille / Moyen de paiement ou Trajet de virement */}
            {isTransfer ? (
              <div className="flex flex-col gap-1 py-2 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-start justify-between">
                  <dt className="font-bold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                    Comptes
                  </dt>
                  <dd className="font-black text-right text-[#111827] dark:text-[#F8FAFC]">
                    <span>De </span>
                    <span className="underline decoration-2">
                      {sourceWallet?.name || transaction.payment}
                    </span>
                    {sourceWallet?.isDeleted ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-400 text-red-500 bg-red-50 dark:bg-red-950/40 ml-1">
                        supprimé
                      </span>
                    ) : sourceWallet?.isArchived ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-neutral-400 text-neutral-500 bg-neutral-100 dark:bg-neutral-800 ml-1">
                        archivé
                      </span>
                    ) : null}
                    <span> vers </span>
                    <span className="underline decoration-2">
                      {targetWallet?.name || "Compte cible"}
                    </span>
                    {targetWallet?.isDeleted ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-400 text-red-500 bg-red-50 dark:bg-red-950/40 ml-1">
                        supprimé
                      </span>
                    ) : targetWallet?.isArchived ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-neutral-400 text-neutral-500 bg-neutral-100 dark:bg-neutral-800 ml-1">
                        archivé
                      </span>
                    ) : null}
                  </dd>
                </div>
                {linkedFee && (
                  <div className="mt-1 p-2 bg-[#FFFBEB] dark:bg-[#2C2108] border border-[#FFE600] rounded-lg text-xs font-bold text-[#111827] dark:text-[#F8FAFC]">
                    Frais associés : {formatCurrency(linkedFee.amount)}
                    {linkedFee.feePercent ? ` (${linkedFee.feePercent} %)` : ""} · Débit total de {sourceWallet?.name || "la source"} : {formatCurrency(Math.abs(Number(transaction.amount)) + linkedFee.amount)}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start justify-between py-2 border-b border-neutral-200 dark:border-neutral-800">
                <dt className="font-bold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                  Portefeuille
                </dt>
                <dd className="font-black text-right flex items-center gap-1">
                  <span
                    className="inline-flex items-center text-xs font-black px-2 py-0.5 border border-[#111827] dark:border-white rounded-md shadow-[1px_1px_0px_0px_#111827] dark:shadow-[1px_1px_0px_0px_#000000]"
                    style={{
                      backgroundColor: walletColor,
                      color: walletTextColor,
                    }}
                  >
                    {transaction.payment}
                  </span>
                  {sourceWallet?.isDeleted ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-400 text-red-500 bg-red-50 dark:bg-red-950/40">
                      supprimé
                    </span>
                  ) : sourceWallet?.isArchived ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-neutral-400 text-neutral-500 bg-neutral-100 dark:bg-neutral-800">
                      archivé
                    </span>
                  ) : null}
                </dd>
              </div>
            )}

            {/* Date et Heure précises */}
            <div className="flex items-start justify-between py-2 border-b border-neutral-200 dark:border-neutral-800">
              <dt className="font-bold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                Date & Heure
              </dt>
              <dd className="font-bold text-right text-[#111827] dark:text-[#F8FAFC]">
                {fullDateDisplay}
              </dd>
            </div>

            {/* Note complète */}
            <div className="py-2 border-b border-neutral-200 dark:border-neutral-800">
              <dt className="font-bold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mb-1">
                <FileText className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                Note / Commentaire
              </dt>
              <dd className="text-xs sm:text-sm text-[#111827] dark:text-[#F8FAFC] whitespace-pre-wrap bg-neutral-50 dark:bg-[#131C31] p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                {transaction.note && transaction.note.trim().length > 0 ? (
                  transaction.note
                ) : (
                  <span className="italic text-neutral-400">Aucune note</span>
                )}
              </dd>
            </div>

            {/* Métadonnées techniques (createdAt / updatedAt) */}
            {(createdDisplay || updatedDisplay) && (
              <div className="pt-1 text-[11px] text-neutral-400 dark:text-neutral-500 space-y-0.5">
                {createdDisplay && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Enregistrée le {createdDisplay}</span>
                  </div>
                )}
                {updatedDisplay && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Modifiée le {updatedDisplay}</span>
                  </div>
                )}
              </div>
            )}
          </dl>

          {/* 3. Actions : Modifier (si non transfert et non frais), Supprimer (si non frais), Fermer */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              <X className="w-4 h-4 mr-1.5" />
              Fermer
            </Button>

            {isTransferFee ? (
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-300 dark:border-amber-700">
                Modifiez ou supprimez le virement d&apos;origine pour ajuster ces frais.
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* Le bouton Modifier est masqué pour les virements internes */}
                {!isTransfer && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setShowEdit(true)}
                    className="flex-1 sm:flex-none justify-center"
                  >
                    <Pencil className="w-4 h-4 mr-1.5" />
                    Modifier
                  </Button>
                )}

                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setShowConfirmDelete(true)}
                  className="flex-1 sm:flex-none justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Supprimer
                </Button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Boîte de confirmation de suppression */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Supprimer cette opération ?"
        message="Cette action est irréversible. L'opération sera définitivement effacée de vos données financières."
        confirmLabel="Supprimer définitivement"
        cancelLabel="Annuler"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />

      {/* Modale d'édition ouverte si l'utilisateur clique sur Modifier */}
      <EditTransactionModal
        transaction={transaction}
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onUpdated={handleEditUpdated}
      />
    </>
  );
}
