import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  DEMO_WALLETS,
  DEMO_TRANSACTIONS,
  DEMO_SUMMARIES,
  DEMO_GLOBAL_BALANCE,
  DEMO_CATEGORY_BREAKDOWN,
} from '../lib/demo/demo-data';

describe('Version 2.14.0 — Accès public, Démo interactive et Activation simplifiée', () => {
  const rootDir = path.resolve(__dirname, '..');
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

  test('Sécurité Middleware : / et /demo autorisés sans session, routes privées protégées', () => {
    const middlewarePath = path.join(rootDir, 'middleware.ts');
    const content = fs.readFileSync(middlewarePath, 'utf8');

    // Vérifie que / et /demo sont déclarés publics
    assert.match(content, /pathname === '\/'/);
    assert.match(content, /pathname === '\/demo'/);
    assert.match(content, /isPublicPage/);

    // Vérifie que les routes privées sans session redirigent vers /login
    assert.match(content, /url\.pathname = '\/login'/);

    // Vérifie que les utilisateurs connectés sur / ou pages auth sont redirigés vers /app
    assert.match(content, /url\.pathname = '\/app'/);

    // Vérifie que le matcher couvre /demo et /app
    assert.match(content, /'\/demo'/);
    assert.match(content, /'\/app'/);
  });

  test('Démo Interactive : Fixtures fictives cohérentes et vérification mathématique en FCFA', () => {
    // 1. Somme des soldes des 4 portefeuilles égale au solde global consolidé
    const sumBalances = DEMO_WALLETS.reduce((sum, w) => sum + w.currentBalance, 0);
    assert.strictEqual(
      sumBalances,
      DEMO_GLOBAL_BALANCE,
      'La somme des soldes des portefeuilles démo doit être rigoureusement égale au solde global'
    );
    assert.strictEqual(DEMO_GLOBAL_BALANCE, 650000, 'Le solde global démo doit être de 650 000 FCFA');

    // 2. Présence des portefeuilles réalistes d’Afrique de l’Ouest
    const walletNames = DEMO_WALLETS.map((w) => w.name);
    assert.ok(walletNames.includes('Espèces'), 'Doit inclure Espèces');
    assert.ok(walletNames.includes('Wave'), 'Doit inclure Wave');
    assert.ok(walletNames.includes('Orange Money'), 'Doit inclure Orange Money');
    assert.ok(walletNames.some((n) => n.includes('Bancaire')), 'Doit inclure un compte bancaire');

    // 3. Couverture des types d’opérations (INCOME, EXPENSE, TRANSFER)
    const txTypes = new Set(DEMO_TRANSACTIONS.map((t) => t.type));
    assert.ok(txTypes.has('INCOME'), 'La démo doit comporter des revenus');
    assert.ok(txTypes.has('EXPENSE'), 'La démo doit comporter des dépenses');
    assert.ok(txTypes.has('TRANSFER'), 'La démo doit comporter un virement interne');

    // 4. Somme des ventilations de dépenses
    const totalBreakdown = DEMO_CATEGORY_BREAKDOWN.reduce((sum, c) => sum + (c.total ?? 0), 0);
    assert.ok(totalBreakdown > 0, 'La ventilation par catégorie doit être positive');
    assert.strictEqual(
      DEMO_SUMMARIES.month.totalExpense >= totalBreakdown,
      true,
      'Les dépenses ventilées doivent correspondre au périmètre mensuel'
    );
  });

  test('Séparation des Layouts : AppShell et ReferenceDataProvider sans requêtes privées publiques', () => {
    // 1. AppShell
    const appShellPath = path.join(rootDir, 'components', 'layout', 'AppShell.tsx');
    assert.ok(fs.existsSync(appShellPath), 'components/layout/AppShell.tsx doit exister');
    const shellContent = fs.readFileSync(appShellPath, 'utf8');

    assert.match(shellContent, /isPublicOrAuthPage/);
    assert.match(shellContent, /pathname === '\/'/);
    assert.match(shellContent, /pathname === '\/demo'/);
    assert.match(shellContent, /pathname === '\/login'/);

    // 2. ReferenceDataProvider
    const providerPath = path.join(rootDir, 'components', 'providers', 'ReferenceDataProvider.tsx');
    const providerContent = fs.readFileSync(providerPath, 'utf8');

    assert.match(providerContent, /readOnly/);
    assert.match(providerContent, /if \(readOnly\) return/);
    assert.match(providerContent, /isPublicOrAuth/);
  });

  test('Onboarding & Inscription : Démarrage express en 1 clic et absence de blocage silencieux', () => {
    // 1. OnboardingStepper
    const stepperPath = path.join(rootDir, 'components', 'onboarding', 'OnboardingStepper.tsx');
    const stepperContent = fs.readFileSync(stepperPath, 'utf8');

    assert.ok(
      stepperContent.includes('Démarrer immédiatement en 1 clic'),
      'OnboardingStepper doit proposer le démarrage express en 1 clic'
    );
    assert.ok(
      stepperContent.includes('window.location.href = "/app"') ||
        stepperContent.includes('router.push("/app")'),
      'OnboardingStepper doit rediriger vers /app'
    );

    // 2. RegisterPage
    const registerPath = path.join(rootDir, 'app', 'register', 'page.tsx');
    const registerContent = fs.readFileSync(registerPath, 'utf8');

    assert.ok(
      registerContent.includes("router.push('/app')") ||
        registerContent.includes('router.push("/app")'),
      'RegisterPage doit rediriger vers /app après inscription'
    );
    assert.ok(
      !registerContent.includes('!evaluatePasswordStrength(password).isValid'),
      'Le bouton submit de RegisterPage ne doit pas être désactivé silencieusement sans explication'
    );
  });

  test('PWA Manifest : Cohérence des icônes et configuration start_url', () => {
    const manifestPath = path.join(rootDir, 'public', 'manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'public/manifest.json doit exister');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    assert.strictEqual(manifest.start_url, '/app', 'Le start_url PWA doit pointer vers /app');
    assert.ok(Array.isArray(manifest.icons), 'Les icônes doivent être déclarées sous forme de tableau');

    // Vérifie que toutes les icônes référencées existent réellement sur le disque
    for (const icon of manifest.icons) {
      const iconFilePath = path.join(rootDir, 'public', icon.src.replace(/^\//, ''));
      assert.ok(
        fs.existsSync(iconFilePath),
        `Le fichier d’icône PWA ${icon.src} référencé dans manifest.json doit exister`
      );
    }
  });

  test('Zéro Emoji : Contrôle strict sur tous les nouveaux composants et fichiers v2.14.0', () => {
    const filesToCheck = [
      path.join(rootDir, 'app', 'page.tsx'),
      path.join(rootDir, 'app', 'demo', 'page.tsx'),
      path.join(rootDir, 'app', 'app', 'page.tsx'),
      path.join(rootDir, 'lib', 'demo', 'demo-data.ts'),
      path.join(rootDir, 'components', 'demo', 'DemoView.tsx'),
      path.join(rootDir, 'components', 'demo', 'DemoActionModal.tsx'),
      path.join(rootDir, 'components', 'public', 'PublicLandingView.tsx'),
      path.join(rootDir, 'components', 'public', 'PublicHeader.tsx'),
      path.join(rootDir, 'components', 'public', 'PublicFooter.tsx'),
      path.join(rootDir, 'components', 'layout', 'AppShell.tsx'),
    ];

    for (const filePath of filesToCheck) {
      assert.ok(fs.existsSync(filePath), `Le fichier ${filePath} doit exister`);
      const content = fs.readFileSync(filePath, 'utf8');
      const match = content.match(emojiRegex);
      assert.strictEqual(
        match,
        null,
        `Fichier ${path.basename(filePath)} contient un emoji interdit : ${match ? match[0] : ''}`
      );
    }
  });
});
