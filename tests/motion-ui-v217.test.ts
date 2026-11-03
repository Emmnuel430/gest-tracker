import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

test('Neobrutalist Motion & Kinetic Fluidity (v2.17.0)', async (t) => {
  const rootDir = path.resolve(__dirname, '..');

  await t.test('globals.css contient les fondations mécaniques CSS "Snappy & Mechanical"', () => {
    const cssPath = path.join(rootDir, 'app', 'globals.css');
    assert.strictEqual(fs.existsSync(cssPath), true, 'globals.css doit exister');
    const css = fs.readFileSync(cssPath, 'utf8');

    // Variables de timing snappy
    assert.match(css, /--ease-snappy:\s*cubic-bezier\(0\.2,\s*0,\s*0,\s*1\)/);
    assert.match(css, /--duration-snappy:\s*150ms/);
    assert.match(css, /--duration-counter:\s*380ms/);

    // Utilitaires mécaniques
    assert.match(css, /\.tabular-nums/);
    assert.match(css, /@keyframes brutal-modal-enter/);
    assert.match(css, /@keyframes brutal-overlay-enter/);
    assert.match(css, /@keyframes brutal-wiggle-stepped/);
    assert.match(css, /@keyframes brutal-marquee/);

    // Guard global d'accessibilité prefers-reduced-motion
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  await t.test('Absence totale de backdrop-blur dans l\'ensemble de l\'application (composants et pages)', () => {
    const scanDirs = [
      path.join(rootDir, 'components'),
      path.join(rootDir, 'app'),
    ];

    const violations: string[] = [];

    function scan(dir: string) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('backdrop-blur')) {
            violations.push(fullPath);
          }
        }
      }
    }

    scanDirs.forEach(scan);

    assert.deepStrictEqual(
      violations,
      [],
      `Des instances de backdrop-blur ont été trouvées dans : ${violations.join(', ')}`
    );
  });

  await t.test('Présence obligatoire des 10 squelettes néobrutalistes loading.tsx pour l\'élimination des cascades', () => {
    const requiredSkeletons = [
      'app/app/loading.tsx',
      'app/historique/loading.tsx',
      'app/gestion/loading.tsx',
      'app/budgets/loading.tsx',
      'app/portefeuilles/loading.tsx',
      'app/dettes/loading.tsx',
      'app/recurrences/loading.tsx',
      'app/entrant/loading.tsx',
      'app/sortant/loading.tsx',
      'app/parametres/loading.tsx',
    ];

    for (const relPath of requiredSkeletons) {
      const fullPath = path.join(rootDir, relPath);
      assert.strictEqual(
        fs.existsSync(fullPath),
        true,
        `Le squelette ${relPath} doit exister pour garantir une navigation instantanée sans CLS`
      );
      const content = fs.readFileSync(fullPath, 'utf8');
      assert.match(content, /export default function/, `${relPath} doit exporter un composant par défaut`);
      assert.match(content, /animate-pulse/, `${relPath} doit utiliser des blocs pulsatifs discrets`);
    }
  });

  await t.test('Présence des composants cinétiques OdometerCounter, SegmentedGauge et de l\'indicateur NavPendingIndicator', () => {
    const odometerPath = path.join(rootDir, 'components', 'ui', 'OdometerCounter.tsx');
    const gaugePath = path.join(rootDir, 'components', 'ui', 'SegmentedGauge.tsx');
    const navIndicatorPath = path.join(rootDir, 'components', 'ui', 'NavPendingIndicator.tsx');
    const reducedMotionPath = path.join(rootDir, 'lib', 'hooks', 'useReducedMotion.ts');

    assert.strictEqual(fs.existsSync(odometerPath), true);
    assert.strictEqual(fs.existsSync(gaugePath), true);
    assert.strictEqual(fs.existsSync(navIndicatorPath), true);
    assert.strictEqual(fs.existsSync(reducedMotionPath), true);
  });
});

