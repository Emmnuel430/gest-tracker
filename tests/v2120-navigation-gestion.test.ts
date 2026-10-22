import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Version 2.12.0 — Navigation 4 onglets, Hub Gestion & Concision', () => {
  const rootDir = path.resolve(__dirname, '..');

  test('BottomNav : Présence des 4 onglets obligatoires (Option B)', () => {
    const bottomNavPath = path.join(rootDir, 'components', 'layout', 'BottomNav.tsx');
    const content = fs.readFileSync(bottomNavPath, 'utf8');

    // Vérifie les 4 routes clés (/app ou / pour Accueil, /historique, /gestion, /parametres)
    assert.match(content, /href:\s*['"](\/|\/app)['"]/);
    assert.match(content, /href:\s*['"]\/historique['"]/);
    assert.match(content, /href:\s*['"]\/gestion['"]/);
    assert.match(content, /href:\s*['"]\/parametres['"]/);

    // Vérifie les 4 libellés
    assert.match(content, /label:\s*['"]Accueil['"]/);
    assert.match(content, /label:\s*['"]Historique['"]/);
    assert.match(content, /label:\s*['"]Gestion['"]/);
    assert.match(content, /label:\s*['"]Profil['"]/);

    // Vérifie la disposition en 4 colonnes
    assert.match(content, /grid-cols-4/);
  });

  test('Sous-pages de Gestion : Boutons retour pointent vers /gestion', () => {
    const views = [
      { name: 'BudgetsView', file: path.join(rootDir, 'components', 'budgets', 'BudgetsView.tsx') },
      { name: 'RecurrencesView', file: path.join(rootDir, 'components', 'recurring', 'RecurrencesView.tsx') },
      { name: 'PortefeuillesView', file: path.join(rootDir, 'components', 'wallets', 'PortefeuillesView.tsx') },
      { name: 'DettesView', file: path.join(rootDir, 'components', 'debts', 'DettesView.tsx') },
    ];

    for (const view of views) {
      const content = fs.readFileSync(view.file, 'utf8');
      assert.ok(
        content.includes('href="/gestion"'),
        `La vue ${view.name} doit comporter un lien de retour vers /gestion`
      );
      assert.ok(
        content.includes('Gestion'),
        `La vue ${view.name} doit afficher le libellé Gestion dans son en-tête`
      );
    }
  });

  test('Hub /gestion : Intégration de getGestionMetricsAction et Smart Badges', () => {
    const pagePath = path.join(rootDir, 'app', 'gestion', 'page.tsx');
    const content = fs.readFileSync(pagePath, 'utf8');

    assert.ok(content.includes('getGestionMetricsAction'), 'La page /gestion doit appeler getGestionMetricsAction');
    assert.ok(content.includes('badgeVariant'), 'La page /gestion doit supporter badgeVariant');
    assert.ok(content.includes('InfoTooltip'), 'La page /gestion doit intégrer InfoTooltip');
  });

  test('Zéro Emoji : Contrôle strict sur tous les fichiers modifiés pour la v2.12.0', () => {
    const filesToCheck = [
      path.join(rootDir, 'components', 'layout', 'BottomNav.tsx'),
      path.join(rootDir, 'app', 'gestion', 'page.tsx'),
      path.join(rootDir, 'actions', 'gestion.ts'),
      path.join(rootDir, 'components', 'budgets', 'BudgetsView.tsx'),
      path.join(rootDir, 'components', 'recurring', 'RecurrencesView.tsx'),
      path.join(rootDir, 'components', 'wallets', 'PortefeuillesView.tsx'),
      path.join(rootDir, 'components', 'debts', 'DettesView.tsx'),
    ];

    // Regex détectant les emojis Unicode
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    for (const filePath of filesToCheck) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(emojiRegex);
        assert.equal(
          match,
          null,
          `Fichier ${path.basename(filePath)} contient un emoji interdit : ${match ? match[0] : ''}`
        );
      }
    }
  });
});
