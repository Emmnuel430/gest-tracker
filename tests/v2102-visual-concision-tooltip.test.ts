import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Version 2.10.2 — Concision visuelle & InfoTooltip', () => {
  test('InfoTooltip: composant sans emojis et utilisant exclusivement Lucide React', () => {
    const tooltipPath = path.resolve(process.cwd(), 'components/ui/InfoTooltip.tsx');
    assert.ok(fs.existsSync(tooltipPath), 'components/ui/InfoTooltip.tsx doit exister');
    const content = fs.readFileSync(tooltipPath, 'utf8');

    // Vérification de la présence de Lucide et absence d'emojis
    assert.ok(content.includes('lucide-react'), 'Doit importer les icônes depuis lucide-react');
    assert.ok(content.includes('Info'), 'Doit utiliser l’icône Info');
    assert.ok(content.includes('role="tooltip"'), 'Doit inclure l’attribut d’accessibilité role="tooltip"');
    
    // Détection d'emojis par regex Unicode
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    assert.strictEqual(emojiRegex.test(content), false, 'Aucun emoji dans InfoTooltip.tsx');
  });

  test('WalletCard: interface épurée sans emojis et avec InfoTooltip', () => {
    const walletCardPath = path.resolve(process.cwd(), 'components/wallets/WalletCard.tsx');
    assert.ok(fs.existsSync(walletCardPath), 'components/wallets/WalletCard.tsx doit exister');
    const content = fs.readFileSync(walletCardPath, 'utf8');

    // Doit importer InfoTooltip
    assert.ok(content.includes('InfoTooltip'), 'WalletCard doit intégrer InfoTooltip');
    assert.ok(!content.includes('Représente'), 'La phrase verbeuse "Représente X% du patrimoine..." doit être retirée');

    // Détection d'emojis
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    assert.strictEqual(emojiRegex.test(content), false, 'Aucun emoji dans WalletCard.tsx');
  });

  test('Calcul de part du patrimoine : bornage sécurisé entre 0 et 100', () => {
    const computeShare = (currentBalance: number, totalAllWallets: number) => {
      if (totalAllWallets <= 0 || currentBalance <= 0) return 0;
      return Math.min(100, Math.round((currentBalance / totalAllWallets) * 100));
    };

    assert.strictEqual(computeShare(5000, 10000), 50);
    assert.strictEqual(computeShare(0, 10000), 0);
    assert.strictEqual(computeShare(-2000, 10000), 0);
    assert.strictEqual(computeShare(15000, 10000), 100, 'Doit être borné à 100% au maximum');
  });
});
