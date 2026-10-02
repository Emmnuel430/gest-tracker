// Moyens de paiement officiels issus de la ROADMAP.md (Section 14)

export const PAYMENT_METHODS = [
  'Wave',
  'Orange Money',
  'Espèces',
  'Compte bancaire',
  'Carte bancaire',
  'Autre',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// Badges & Couleurs Néobrutalistes pour les moyens de paiement
export const PAYMENT_METHOD_THEMES: Record<string, { bg: string; text: string }> = {
  'Wave': { bg: '#1DC4F2', text: '#000000' }, // Bleu Wave emblématique
  'Orange Money': { bg: '#FF7900', text: '#000000' }, // Orange OM
  'Espèces': { bg: '#52B788', text: '#000000' }, // Vert billets
  'Compte bancaire': { bg: '#B8C0FF', text: '#000000' }, // Bleu pastel
  'Carte bancaire': { bg: '#FFD166', text: '#000000' }, // Jaune or
  'Autre': { bg: '#E0E0E0', text: '#000000' }, // Gris neutre
};
