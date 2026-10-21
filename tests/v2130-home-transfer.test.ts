import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Version 2.13.0 — Trilogie Financière sur Accueil & Action Bar 2+1', () => {
  const rootDir = path.resolve(__dirname, '..');

  test('HomeActions : Présence des 3 boutons de la Trilogie Financière (Entrant, Sortant, Virement)', () => {
    const homeActionsPath = path.join(rootDir, 'components', 'home', 'HomeActions.tsx');
    const content = fs.readFileSync(homeActionsPath, 'utf8');

    // 1. Entrant
    assert.match(content, /href=['"]\/entrant['"]/);
    assert.match(content, /ENTRANT/);
    assert.match(content, /ArrowDownLeft/);

    // 2. Sortant
    assert.match(content, /href=['"]\/sortant['"]/);
    assert.match(content, /SORTANT/);
    assert.match(content, /ArrowUpRight/);

    // 3. Virement Interne
    assert.match(content, /VIREMENT INTERNE/);
    assert.match(content, /ArrowRightLeft/);
    assert.match(content, /TransferModal/);

    // 4. Suppression absolue de l'ancien bouton redondant HISTORIQUE
    assert.equal(
      content.includes('href="/historique"') || content.includes("href='/historique'"),
      false,
      "HomeActions ne doit plus comporter de lien vers /historique (déporté dans la BottomNav)"
    );
  });

  test('HomeActions : Disposition compacte 2+1 (grille 2 colonnes + bouton pleine largeur)', () => {
    const homeActionsPath = path.join(rootDir, 'components', 'home', 'HomeActions.tsx');
    const content = fs.readFileSync(homeActionsPath, 'utf8');

    // Vérifie la grille responsive à 2 colonnes
    assert.match(content, /grid-cols-2/);
    // Vérifie la concision visuelle (aucun sous-titre verbeux type "Enregistrer une dépense en quelques secondes")
    assert.equal(
      content.includes('Enregistrer une dépense en quelques secondes'),
      false,
      'Les descriptions verbeuses doivent être supprimées conformément aux règles'
    );
    assert.equal(
      content.includes('Consulter les opérations'),
      false,
      'Les descriptions verbeuses doivent être supprimées'
    );
  });

  test('TransferModal : Gestion pédagogique et sécurisée en cas de moins de 2 portefeuilles', () => {
    const transferModalPath = path.join(rootDir, 'components', 'wallets', 'TransferModal.tsx');
    const content = fs.readFileSync(transferModalPath, 'utf8');

    // Vérifie la garde sur wallets.length < 2
    assert.match(content, /wallets\.length\s*<\s*2/);
    assert.match(content, /href=['"]\/portefeuilles['"]/);
  });

  test('PortefeuillesView : Préservation du bouton de virement contextuel et dans l’en-tête', () => {
    const portefeuillesPath = path.join(rootDir, 'components', 'wallets', 'PortefeuillesView.tsx');
    const content = fs.readFileSync(portefeuillesPath, 'utf8');

    assert.match(content, /ArrowRightLeft/);
    assert.match(content, /handleOpenTransfer/);
  });

  test('Zéro Emoji : Contrôle strict sur tous les fichiers modifiés pour la v2.13.0', () => {
    const filesToCheck = [
      path.join(rootDir, 'components', 'home', 'HomeActions.tsx'),
      path.join(rootDir, 'app', 'page.tsx'),
      path.join(rootDir, 'components', 'wallets', 'TransferModal.tsx'),
      path.join(rootDir, 'components', 'wallets', 'PortefeuillesView.tsx'),
    ];

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
