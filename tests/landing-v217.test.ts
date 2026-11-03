import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LANDING_CAPABILITIES,
  LANDING_STEPS,
  LANDING_FAQ,
  LandingCapability,
} from '../constants/landing';

test('Landing Page Vitrine & Capacités d\'Action (v2.17.0)', async (t) => {
  await t.test('Contient exactement 8 capacités d\'action percutantes axées sur des verbes', () => {
    assert.strictEqual(LANDING_CAPABILITIES.length, 8);

    const validDemoTabs = ['dashboard', 'wallets', 'stats', 'history'];

    LANDING_CAPABILITIES.forEach((cap: LandingCapability) => {
      // Vérification des champs requis
      assert.ok(cap.id, 'Chaque capacité doit avoir un identifiant unique');
      assert.ok(cap.verbTitle, 'Chaque capacité doit commencer par un verbe');
      assert.ok(cap.benefit, 'Chaque capacité doit avoir une phrase de bénéfice');
      assert.ok(cap.color, 'Chaque capacité doit avoir un thème de couleur néobrutaliste');
      assert.ok(cap.iconName, 'Chaque capacité doit avoir un nom d\'icône Lucide');

      // Vérification des cibles démo
      assert.strictEqual(
        validDemoTabs.includes(cap.demoTab),
        true,
        `La cible demoTab "${cap.demoTab}" doit correspondre à un onglet supporté par DemoView`
      );

      // Le titre commence par un verbe à l'infinitif
      const firstWord = cap.verbTitle.split(' ')[0];
      assert.match(firstWord, /(er|ir|re)$/i, `Le premier mot "${firstWord}" doit être un verbe`);
    });
  });

  await t.test('Le parcours "Comment ça marche" contient exactement 3 étapes logiques', () => {
    assert.strictEqual(LANDING_STEPS.length, 3);
    assert.strictEqual(LANDING_STEPS[0].number, '01');
    assert.strictEqual(LANDING_STEPS[1].number, '02');
    assert.strictEqual(LANDING_STEPS[2].number, '03');
  });

  await t.test('La FAQ contient au moins 4 réponses précises avec réponses concises', () => {
    assert.ok(LANDING_FAQ.length >= 4);
    LANDING_FAQ.forEach((faq) => {
      assert.ok(faq.question.length > 5);
      assert.ok(faq.answer.length > 10);
    });
  });

  await t.test('Absence stricte d\'emojis dans les constantes de la vitrine', () => {
    const jsonStr = JSON.stringify({
      LANDING_CAPABILITIES,
      LANDING_STEPS,
      LANDING_FAQ,
    });

    // Détection stricte des emojis réels sans capturer la ponctuation typographique standard
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    const matches = jsonStr.match(emojiRegex);
    assert.strictEqual(
      matches,
      null,
      `Aucun emoji ne doit être présent dans la vitrine (trouvé: ${matches?.join(', ')})`
    );
  });
});
