"use client";

import React, { useState, useTransition } from "react";
import {
  Edit2,
  Trash2,
  ArrowRightLeft,
  Star,
  Smartphone,
  CreditCard,
  Banknote,
  PiggyBank,
  Archive,
  ArchiveRestore,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/constants/config";
import {
  WalletItem,
  deleteWalletAction,
  archiveWalletAction,
  getWalletDeletionImpactAction,
  WalletDeletionImpact,
} from "@/actions/wallets";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

interface WalletCardProps {
  wallet: WalletItem;
  totalAllWallets: number;
  onEdit: (wallet: WalletItem) => void;
  onTransfer: (sourceWalletId: string) => void;
  onRefresh: () => void;
}

export function WalletCard({
  wallet,
  totalAllWallets,
  onEdit,
  onTransfer,
  onRefresh,
}: WalletCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [deletionImpact, setDeletionImpact] =
    useState<WalletDeletionImpact | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(
    null,
  );

  const handleDeleteClick = () => {
    if (wallet.isDefault) {
      setActionErrorMessage(
        "Désignez d’abord un autre compte principal avant de supprimer celui-ci.",
      );
      return;
    }

    startTransition(async () => {
      const res = await getWalletDeletionImpactAction(wallet.id);
      if (res.success) {
        setDeletionImpact(res.data);
        setIsDeleteDialogOpen(true);
      } else {
        setActionErrorMessage(
          res.error || "Impossible de vérifier l’impact de la suppression.",
        );
      }
    });
  };

  const confirmDelete = () => {
    startTransition(async () => {
      const res = await deleteWalletAction(wallet.id);
      if (!res.success) {
        setIsDeleteDialogOpen(false);
        setActionErrorMessage(
          res.error || "Impossible de supprimer ce compte.",
        );
        return;
      }
      setIsDeleteDialogOpen(false);
      onRefresh();
    });
  };

  const confirmToggleArchive = () => {
    const nextArchived = !wallet.isArchived;
    startTransition(async () => {
      const res = await archiveWalletAction(wallet.id, nextArchived);
      if (!res.success) {
        setIsArchiveDialogOpen(false);
        setActionErrorMessage(
          res.error || "Erreur lors de la mise à jour du portefeuille.",
        );
        return;
      }
      setIsArchiveDialogOpen(false);
      onRefresh();
    });
  };

  // Calcul du % du patrimoine
  const sharePercentage =
    totalAllWallets > 0 && wallet.currentBalance > 0
      ? parseFloat(
          Math.min(
            100,
            (wallet.currentBalance / totalAllWallets) * 100,
          ).toFixed(1),
        )
      : 0;

  // Icône selon le type
  let TypeIcon = Banknote;
  let typeLabel = "Espèces";
  if (wallet.type === "MOBILE_MONEY") {
    TypeIcon = Smartphone;
    typeLabel = "Mobile Money";
  } else if (wallet.type === "BANK") {
    TypeIcon = CreditCard;
    typeLabel = "Banque";
  } else if (wallet.type === "SAVINGS") {
    TypeIcon = PiggyBank;
    typeLabel = "Épargne";
  }

  return (
    <div
      className={`p-4 rounded-2xl border-3 transition-all flex flex-col justify-between gap-3.5 ${
        wallet.isArchived
          ? "bg-neutral-50 dark:bg-[#1E293B]/60 border-dashed border-neutral-400 dark:border-neutral-600 opacity-80"
          : "bg-white dark:bg-[#1E293B] border-[#111827] dark:border-[#334155] shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000]"
      }`}
    >
      {/* 1. En-tête : Identité visuelle, type & boutons d'action rapides */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-10 h-10 rounded-xl border-2 border-[#111827] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#111827]"
            style={{ backgroundColor: wallet.color }}
          >
            <TypeIcon className="w-5 h-5 stroke-2.5 text-[#111827]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-black text-base text-[#111827] dark:text-[#F8FAFC] truncate">
                {wallet.name}
              </h4>
              {wallet.isDefault && (
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-[#FFE600] text-[#111827] border border-[#111827] flex items-center gap-0.5 shadow-[1px_1px_0px_0px_#111827]">
                  <Star className="w-2.5 h-2.5 fill-[#111827]" />
                  Principal
                </span>
              )}
              {wallet.isArchived && (
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-[#111827] dark:border-neutral-500">
                  Archivé
                </span>
              )}
            </div>
            <span className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              {typeLabel}
            </span>
          </div>
        </div>

        {/* Boutons d'actions épurés */}
        <div className="flex items-center gap-1 shrink-0">
          {!wallet.isDefault && (
            <button
              type="button"
              onClick={() => setIsArchiveDialogOpen(true)}
              disabled={isPending}
              aria-label={
                wallet.isArchived
                  ? "Désarchiver le compte"
                  : "Archiver le compte"
              }
              title={wallet.isArchived ? "Désarchiver" : "Archiver"}
              className="p-1.5 rounded-lg border-2 border-[#111827] dark:border-[#334155] bg-neutral-100 dark:bg-[#131C31] hover:bg-neutral-200 dark:hover:bg-[#1E293B] text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer shadow-[1px_1px_0px_0px_#111827]"
            >
              {wallet.isArchived ? (
                <ArchiveRestore className="w-3.5 h-3.5 stroke-2.5" />
              ) : (
                <Archive className="w-3.5 h-3.5 stroke-2.5" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(wallet)}
            disabled={isPending}
            aria-label="Modifier le compte"
            title="Modifier"
            className="p-1.5 rounded-lg border-2 border-[#111827] dark:border-[#334155] bg-neutral-100 dark:bg-[#131C31] hover:bg-[#FFE600] hover:text-[#111827] text-[#111827] dark:text-[#F8FAFC] transition-all cursor-pointer shadow-[1px_1px_0px_0px_#111827]"
          >
            <Edit2 className="w-3.5 h-3.5 stroke-2.5" />
          </button>
          {!wallet.isDefault && (
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={isPending}
              aria-label="Supprimer le compte"
              title="Supprimer"
              className="p-1.5 rounded-lg border-2 border-[#111827] dark:border-[#334155] bg-neutral-100 dark:bg-[#131C31] hover:bg-[#FF3366] hover:text-white text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer shadow-[1px_1px_0px_0px_#111827]"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Solde disponible & part du patrimoine (sans verbiage) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Solde disponible
            </span>
            {wallet.declaredAt && (
              <InfoTooltip
                title="Solde de référence"
                content={
                  <span>
                    Dernière référence constatée :{" "}
                    <strong>
                      {formatCurrency(wallet.declaredBalance ?? 0)}
                    </strong>{" "}
                    le{" "}
                    {new Date(wallet.declaredAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    . Les opérations ultérieures sont ajoutées ou déduites de ce
                    montant.
                  </span>
                }
              />
            )}
          </div>
          {wallet.declaredAt && (
            <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              Réf.{" "}
              {new Date(wallet.declaredAt).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          )}
        </div>

        <div
          className={`text-2xl sm:text-3xl font-black tracking-tight ${
            wallet.currentBalance >= 0
              ? "text-[#111827] dark:text-[#F8FAFC]"
              : "text-[#FF3366]"
          }`}
        >
          {formatCurrency(wallet.currentBalance)}
        </div>

        {/* Barre de part du patrimoine & badge compact */}
        {totalAllWallets > 0 && wallet.currentBalance > 0 && (
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
              <span>Part du patrimoine</span>
              <span className="font-black text-[#111827] dark:text-[#F8FAFC]">
                {sharePercentage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 dark:bg-[#131C31] rounded-full border border-neutral-300 dark:border-neutral-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${sharePercentage}%`,
                  backgroundColor: wallet.color || "#2563EB",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Synthèse Entrées / Sorties en capsules compactes */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="p-2 rounded-xl bg-neutral-50 dark:bg-[#131C31] border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">
            <ArrowDownLeft className="w-3 h-3 text-[#00DF81] stroke-3" />
            <span>Entrées</span>
          </div>
          <div className="text-xs font-black text-[#00DF81] truncate mt-0.5">
            +{formatCurrency(wallet.totalIncome)}
          </div>
        </div>

        <div className="p-2 rounded-xl bg-neutral-50 dark:bg-[#131C31] border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">
            <ArrowUpRight className="w-3 h-3 text-[#FF3366] stroke-3" />
            <span>Sorties</span>
          </div>
          <div className="text-xs font-black text-[#FF3366] truncate mt-0.5">
            -{formatCurrency(wallet.totalExpense)}
          </div>
        </div>
      </div>

      {/* 4. Action de virement rapide (bouton concis) */}
      {!wallet.isArchived && (
        <button
          type="button"
          onClick={() => onTransfer(wallet.id)}
          className="w-full py-2 px-3 bg-neutral-100 dark:bg-[#131C31] hover:bg-[#FFE600] text-[#111827] dark:text-[#F8FAFC] hover:text-[#111827] font-black text-xs uppercase rounded-xl border-2 border-[#111827] dark:border-[#334155] hover:border-[#111827] flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 stroke-2.5" />
          Virement
        </button>
      )}

      {/* Modale de confirmation de suppression */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title={`Supprimer "${wallet.name}" ?`}
        message={`Supprimer ${wallet.name} ? Ses ${
          deletionImpact?.transactionCount ?? 0
        } opérations restent dans votre historique. Son solde (${formatCurrency(
          deletionImpact?.currentBalance ?? wallet.currentBalance,
        )}) sera exclu du patrimoine.${
          deletionImpact && deletionImpact.activeRulesCount > 0
            ? ` ${deletionImpact.activeRulesCount} règle(s) en pause.`
            : ""
        }`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isLoading={isPending}
        loadingLabel="Suppression..."
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />

      {/* Modale de confirmation d'archivage */}
      <ConfirmDialog
        isOpen={isArchiveDialogOpen}
        title={
          wallet.isArchived ? "Désarchiver le compte" : "Archiver le compte"
        }
        message={
          wallet.isArchived
            ? `Désarchiver "${wallet.name}" pour vos futures opérations ?`
            : `Archiver "${wallet.name}" ? Le compte ne sera plus proposé pour les nouvelles opérations.`
        }
        confirmLabel={wallet.isArchived ? "Désarchiver" : "Archiver"}
        cancelLabel="Annuler"
        variant="warning"
        isLoading={isPending}
        loadingLabel={wallet.isArchived ? "Désarchivage..." : "Archivage..."}
        onCancel={() => setIsArchiveDialogOpen(false)}
        onConfirm={confirmToggleArchive}
      />

      {/* Modale d'erreur d'action */}
      <ConfirmDialog
        isOpen={actionErrorMessage !== null}
        title="Action impossible"
        message={actionErrorMessage || ""}
        confirmLabel="Compris"
        cancelLabel="Fermer"
        variant="danger"
        onCancel={() => setActionErrorMessage(null)}
        onConfirm={() => setActionErrorMessage(null)}
      />
    </div>
  );
}
