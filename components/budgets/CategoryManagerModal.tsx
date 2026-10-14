'use client';

import React, { useState, useTransition, useMemo } from 'react';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  Sparkles,
  Tag,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useCategories } from '@/components/providers/ReferenceDataProvider';
import { CategoryItem } from '@/lib/categories';
import { upsertCategoryAction, archiveCategoryAction, deleteCategoryAction } from '@/actions/categories';
import { CategoryKind } from '@prisma/client';

export const CONTROLLED_PALETTE = [
  '#FF5964', '#FF9F1C', '#FFBE0B', '#00DF81', '#2EC4B6',
  '#3A86FF', '#4361EE', '#7209B7', '#8338EC', '#B5179E',
  '#F72585', '#E71D36', '#FB5607', '#4CC9F0', '#70E000',
  '#38B000', '#52B788', '#0EA5E9', '#F59E0B', '#9E9E9E',
];

import { getContrastTextColor } from '@/lib/utils';
export { getContrastTextColor };

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryManagerModal({ isOpen, onClose }: CategoryManagerModalProps) {
  const { allCategories, refreshCategories } = useCategories(undefined, { includeArchived: true });
  const [isPending, startTransition] = useTransition();

  // Mode gestion de liste vs formulaire d'ajout/édition
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
  const [filterKind, setFilterKind] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'ARCHIVED'>('ALL');

  // Formulaire state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<CategoryKind>('EXPENSE');
  const [color, setColor] = useState('#FF5964');
  const [formError, setFormError] = useState<string | null>(null);

  // Suppression dialog state
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Filtrage de la liste
  const displayedCategories = useMemo(() => {
    return allCategories.filter((cat) => {
      if (filterKind === 'ARCHIVED') return cat.isArchived;
      if (cat.isArchived) return false;
      if (filterKind === 'INCOME') return cat.kind === 'INCOME' || cat.kind === 'BOTH';
      if (filterKind === 'EXPENSE') return cat.kind === 'EXPENSE' || cat.kind === 'BOTH';
      return true;
    });
  }, [allCategories, filterKind]);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setKind('EXPENSE');
    const randomColor = CONTROLLED_PALETTE[Math.floor(Math.random() * CONTROLLED_PALETTE.length)];
    setColor(randomColor);
    setFormError(null);
    setViewMode('FORM');
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setName(cat.name);
    setKind(cat.kind);
    setColor(cat.color);
    setFormError(null);
    setViewMode('FORM');
  };

  const handleRandomColor = () => {
    const randomColor = CONTROLLED_PALETTE[Math.floor(Math.random() * CONTROLLED_PALETTE.length)];
    setColor(randomColor);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Le nom de la catégorie est obligatoire');
      return;
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      setFormError('La couleur doit être un code hexadécimal valide (#RRGGBB)');
      return;
    }

    setFormError(null);
    startTransition(async () => {
      const res = await upsertCategoryAction({
        id: editingId || undefined,
        name: name.trim(),
        kind,
        color,
      });

      if (!res.success) {
        setFormError(res.error || 'Une erreur est survenue');
        return;
      }

      await refreshCategories();
      setViewMode('LIST');
    });
  };

  const handleToggleArchive = (cat: CategoryItem) => {
    startTransition(async () => {
      await archiveCategoryAction(cat.id, !cat.isArchived);
      await refreshCategories();
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setDeleteErrorMessage(null);
    startTransition(async () => {
      const res = await deleteCategoryAction(deleteTarget.id);
      if (!res.success) {
        setDeleteErrorMessage(res.error || 'Impossible de supprimer cette catégorie');
        return;
      }
      setDeleteTarget(null);
      await refreshCategories();
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#111827]/70 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="w-full max-w-lg bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000] flex flex-col max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-neutral-200 dark:border-[#334155] bg-neutral-50 dark:bg-[#131C31]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#FFE600] text-[#111827] border-2 border-[#111827] rounded-lg shadow-[1px_1px_0px_0px_#111827]">
                <Tag className="w-4 h-4 stroke-2.5" />
              </div>
              <h2 className="text-base font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
                {viewMode === 'FORM'
                  ? editingId
                    ? 'Modifier la catégorie'
                    : 'Nouvelle catégorie'
                  : 'Gestion des Catégories'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-[#111827] dark:hover:text-white rounded-lg hover:bg-neutral-200 dark:hover:bg-[#334155] transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 stroke-2.5" />
            </button>
          </div>

          {/* Corps de la modale */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {viewMode === 'LIST' ? (
              <>
                {/* Barre d'actions & Filtres */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    {(['ALL', 'EXPENSE', 'INCOME', 'ARCHIVED'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setFilterKind(mode)}
                        className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-lg border-2 border-[#111827] dark:border-[#334155] transition-all whitespace-nowrap ${
                          filterKind === mode
                            ? 'bg-[#111827] text-white dark:bg-white dark:text-[#111827] shadow-[2px_2px_0px_0px_#FFE600]'
                            : 'bg-white dark:bg-[#1E293B] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        {mode === 'ALL'
                          ? 'Toutes'
                          : mode === 'EXPENSE'
                          ? 'Dépenses'
                          : mode === 'INCOME'
                          ? 'Revenus'
                          : 'Archivées'}
                      </button>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleOpenAdd}
                    className="flex items-center gap-1 self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-3" />
                    <span>Ajouter</span>
                  </Button>
                </div>

                {deleteErrorMessage && (
                  <div className="p-3 bg-[#FEE2E2] dark:bg-[#7F1D1D]/30 border-2 border-[#EF4444] rounded-xl flex items-start gap-2 text-[#991B1B] dark:text-[#FCA5A5] text-xs font-bold leading-snug">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{deleteErrorMessage}</span>
                  </div>
                )}

                {/* Liste des catégories */}
                {displayedCategories.length === 0 ? (
                  <div className="text-center py-10 px-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Aucune catégorie trouvée
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayedCategories.map((cat) => {
                      const textColor = getContrastTextColor(cat.color);
                      return (
                        <div
                          key={cat.id}
                          className="flex items-center justify-between p-2.5 bg-white dark:bg-[#1E293B] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]"
                        >
                          {/* Badge & Nom */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="px-2.5 py-1 text-xs font-black uppercase rounded-lg border-2 border-[#111827] shrink-0"
                              style={{ backgroundColor: cat.color, color: textColor }}
                            >
                              {cat.name}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400">
                              <span>
                                {cat.kind === 'BOTH'
                                  ? 'Mixte'
                                  : cat.kind === 'INCOME'
                                  ? 'Revenu'
                                  : 'Dépense'}
                              </span>
                              {cat.isArchived && (
                                <span className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded border border-neutral-400">
                                  Archivée
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(cat)}
                              className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-[#111827] dark:hover:text-white rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-[#334155] transition-all"
                              title="Modifier"
                            >
                              <Pencil className="w-3.5 h-3.5 stroke-2.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleArchive(cat)}
                              className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-[#111827] dark:hover:text-white rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-[#334155] transition-all"
                              title={cat.isArchived ? 'Désarchiver' : 'Archiver'}
                            >
                              {cat.isArchived ? (
                                <ArchiveRestore className="w-3.5 h-3.5 stroke-2.5 text-[#2563EB]" />
                              ) : (
                                <Archive className="w-3.5 h-3.5 stroke-2.5 text-[#D97706]" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteErrorMessage(null);
                                setDeleteTarget(cat);
                              }}
                              className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-[#DC2626] rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                              title="Supprimer définitivement"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              /* Mode Formulaire */
              <form onSubmit={handleSubmitForm} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-[#FEE2E2] dark:bg-[#7F1D1D]/30 border-2 border-[#EF4444] rounded-xl flex items-start gap-2 text-[#991B1B] dark:text-[#FCA5A5] text-xs font-bold leading-snug">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Nom */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                    Nom de la catégorie *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={40}
                    placeholder="Ex: Formations, Loisirs, Transport..."
                    required
                    className="w-full p-2.5 bg-neutral-50 dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-xl font-bold text-sm text-[#111827] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
                  />
                </div>

                {/* Type de flux (Kind) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                    Type d’opérations *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'EXPENSE', label: 'Dépense' },
                      { value: 'INCOME', label: 'Revenu' },
                      { value: 'BOTH', label: 'Mixte (Les deux)' },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setKind(item.value as CategoryKind)}
                        className={`p-2 rounded-xl border-2 border-[#111827] dark:border-[#334155] text-xs font-black uppercase transition-all ${
                          kind === item.value
                            ? 'bg-[#FFE600] text-[#111827] shadow-[2px_2px_0px_0px_#111827]'
                            : 'bg-white dark:bg-[#1E293B] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Palette de couleurs & Aperçu */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase text-[#111827] dark:text-[#F8FAFC]">
                      Couleur distinctive
                    </label>
                    <button
                      type="button"
                      onClick={handleRandomColor}
                      className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-[#2563EB] dark:text-[#60A5FA] hover:underline"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Aléatoire</span>
                    </button>
                  </div>

                  {/* Grille de sélection */}
                  <div className="grid grid-cols-10 gap-1.5 p-2.5 bg-neutral-50 dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-xl">
                    {CONTROLLED_PALETTE.map((palColor) => (
                      <button
                        key={palColor}
                        type="button"
                        onClick={() => setColor(palColor)}
                        style={{ backgroundColor: palColor }}
                        className={`w-7 h-7 rounded-lg border-2 border-[#111827] flex items-center justify-center transition-transform hover:scale-110 ${
                          color.toLowerCase() === palColor.toLowerCase()
                            ? 'ring-2 ring-[#FFE600] scale-110 shadow-[1px_1px_0px_0px_#111827]'
                            : ''
                        }`}
                        title={palColor}
                      >
                        {color.toLowerCase() === palColor.toLowerCase() && (
                          <Check
                            className="w-4 h-4 stroke-3"
                            style={{ color: getContrastTextColor(palColor) }}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Saisie hexadécimale directe */}
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-10 h-10 p-0.5 rounded-lg border-2 border-[#111827] cursor-pointer bg-white"
                      title="Sélecteur libre"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      maxLength={7}
                      className="w-28 p-2 text-xs font-mono font-bold uppercase bg-neutral-50 dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] rounded-xl focus:outline-none"
                    />
                    <span className="text-xs text-neutral-500 font-bold">Code couleur</span>
                  </div>

                  {/* Aperçu du badge en direct */}
                  <div className="pt-2">
                    <div className="text-[11px] font-black uppercase text-neutral-500 mb-1">
                      Aperçu dans l’application
                    </div>
                    <div className="p-3 bg-neutral-100 dark:bg-[#131C31] border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl flex items-center gap-3">
                      <span
                        className="px-3 py-1.5 text-xs font-black uppercase rounded-lg border-2 border-[#111827] shadow-[2px_2px_0px_0px_#111827]"
                        style={{
                          backgroundColor: color,
                          color: getContrastTextColor(color),
                        }}
                      >
                        {name.trim() || 'Exemple'}
                      </span>
                      <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                        {kind === 'BOTH' ? 'Valable pour revenus et dépenses' : kind === 'INCOME' ? 'Réservé aux revenus' : 'Réservé aux dépenses'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action du formulaire */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <Button
                    type="button"
                    variant="neutral"
                    size="md"
                    onClick={() => setViewMode('LIST')}
                    disabled={isPending}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isPending}
                    className="flex items-center gap-1.5"
                  >
                    {isPending ? 'Enregistrement...' : editingId ? 'Enregistrer les modifications' : 'Créer la catégorie'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation de suppression */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Supprimer la catégorie"
        message={`Êtes-vous certain de vouloir supprimer définitivement la catégorie "${deleteTarget?.name}" ? Si des opérations y sont rattachées, la suppression sera refusée et l'archivage vous sera proposé.`}
        confirmLabel="Supprimer définitivement"
        cancelLabel="Annuler"
        isLoading={isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
