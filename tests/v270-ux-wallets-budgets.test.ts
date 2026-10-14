import test from 'node:test';
import assert from 'node:assert/strict';

test('Version 2.7.0 — Wallet Color Uniqueness Specifications', async (t) => {
  interface MockWallet {
    id: string;
    userId: string;
    name: string;
    color: string;
  }

  const validateWalletColorUniqueness = (
    wallets: MockWallet[],
    userId: string,
    color: string,
    walletId?: string
  ) => {
    const duplicate = wallets.find(
      (w) =>
        w.userId === userId &&
        w.color.toLowerCase() === color.toLowerCase() &&
        w.id !== walletId
    );
    if (duplicate) {
      return {
        success: false,
        error: `Cette couleur est déjà attribuée au portefeuille "${duplicate.name}". Veuillez choisir une autre couleur.`,
      };
    }
    return { success: true };
  };

  const existingWallets: MockWallet[] = [
    { id: 'w1', userId: 'user-1', name: 'Espèces', color: '#52B788' },
    { id: 'w2', userId: 'user-1', name: 'Wave', color: '#1DC4F2' },
    { id: 'w3', userId: 'user-1', name: 'Banque', color: '#B8C0FF' },
    { id: 'w4', userId: 'user-2', name: 'Wave User 2', color: '#1DC4F2' },
  ];

  await t.test('rejette la création d’un portefeuille avec une couleur déjà utilisée par le même utilisateur', () => {
    const res = validateWalletColorUniqueness(existingWallets, 'user-1', '#1dc4f2');
    assert.strictEqual(res.success, false);
    assert.match(res.error || '', /Wave/);
  });

  await t.test('rejette la mise à jour d’un portefeuille vers une couleur occupée par un autre compte', () => {
    const res = validateWalletColorUniqueness(existingWallets, 'user-1', '#52B788', 'w2');
    assert.strictEqual(res.success, false);
    assert.match(res.error || '', /Espèces/);
  });

  await t.test('autorise un portefeuille à conserver sa propre couleur lors d’une mise à jour', () => {
    const res = validateWalletColorUniqueness(existingWallets, 'user-1', '#1DC4F2', 'w2');
    assert.strictEqual(res.success, true);
  });

  await t.test('autorise l’utilisation d’une nouvelle couleur libre', () => {
    const res = validateWalletColorUniqueness(existingWallets, 'user-1', '#FF3366');
    assert.strictEqual(res.success, true);
  });

  await t.test('garantit l’isolation multi-utilisateur : deux utilisateurs distincts peuvent utiliser la même couleur', () => {
    // user-1 utilise déjà #52B788, user-2 doit pouvoir l'utiliser
    const res = validateWalletColorUniqueness(existingWallets, 'user-2', '#52B788');
    assert.strictEqual(res.success, true);
  });
});

test('Version 2.7.0 — Category Color Uniqueness Specifications', async (t) => {
  interface MockCategory {
    id: string;
    userId: string;
    name: string;
    color: string;
  }

  const validateCategoryColorUniqueness = (
    categories: MockCategory[],
    userId: string,
    color: string,
    categoryId?: string
  ) => {
    const duplicate = categories.find(
      (c) =>
        c.userId === userId &&
        c.color.toLowerCase() === color.toLowerCase() &&
        c.id !== categoryId
    );
    if (duplicate) {
      return {
        success: false,
        error: `Cette couleur est déjà attribuée à la catégorie "${duplicate.name}". Veuillez choisir une autre couleur.`,
      };
    }
    return { success: true };
  };

  const existingCategories: MockCategory[] = [
    { id: 'c1', userId: 'user-1', name: 'Alimentation', color: '#FF5964' },
    { id: 'c2', userId: 'user-1', name: 'Transport', color: '#FF9F1C' },
    { id: 'c3', userId: 'user-1', name: 'Salaire', color: '#00DF81' },
    { id: 'c4', userId: 'user-2', name: 'Alimentation U2', color: '#FF5964' },
  ];

  await t.test('rejette à la création une couleur déjà prise par une autre catégorie', () => {
    const res = validateCategoryColorUniqueness(existingCategories, 'user-1', '#ff5964');
    assert.strictEqual(res.success, false);
    assert.match(res.error || '', /Alimentation/);
  });

  await t.test('rejette à l’édition une couleur déjà prise par une autre catégorie (même en edit)', () => {
    const res = validateCategoryColorUniqueness(existingCategories, 'user-1', '#00DF81', 'c2');
    assert.strictEqual(res.success, false);
    assert.match(res.error || '', /Salaire/);
  });

  await t.test('autorise à l’édition la conservation de sa propre couleur', () => {
    const res = validateCategoryColorUniqueness(existingCategories, 'user-1', '#FF9F1C', 'c2');
    assert.strictEqual(res.success, true);
  });

  await t.test('autorise l’utilisation d’une couleur vacante', () => {
    const res = validateCategoryColorUniqueness(existingCategories, 'user-1', '#7209B7');
    assert.strictEqual(res.success, true);
  });

  await t.test('garantit l’isolation multi-utilisateur pour les couleurs de catégories', () => {
    const res = validateCategoryColorUniqueness(existingCategories, 'user-2', '#00DF81');
    assert.strictEqual(res.success, true);
  });
});

test('Version 2.7.0 — TransferModal Auto-selection Logic', async (t) => {
  interface MockWallet {
    id: string;
    name: string;
  }

  const resolveTransferAccounts = (
    wallets: MockWallet[],
    defaultSourceId?: string
  ) => {
    const activeSource =
      defaultSourceId && wallets.some((w) => w.id === defaultSourceId)
        ? defaultSourceId
        : wallets[0]?.id || '';

    const activeTarget = wallets.find((w) => w.id !== activeSource)?.id || '';

    return { sourceId: activeSource, targetId: activeTarget };
  };

  const wallets: MockWallet[] = [
    { id: 'w-cash', name: 'Espèces' },
    { id: 'w-wave', name: 'Wave' },
    { id: 'w-bank', name: 'Banque' },
  ];

  await t.test('auto-sélectionne le portefeuille source quand defaultSourceId est fourni', () => {
    const result = resolveTransferAccounts(wallets, 'w-wave');
    assert.strictEqual(result.sourceId, 'w-wave');
    assert.strictEqual(result.targetId, 'w-cash');
  });

  await t.test('sélectionne le premier portefeuille par défaut si defaultSourceId est indéfini', () => {
    const result = resolveTransferAccounts(wallets, undefined);
    assert.strictEqual(result.sourceId, 'w-cash');
    assert.strictEqual(result.targetId, 'w-wave');
  });

  await t.test('garantit que le compte cible est toujours distinct du compte source', () => {
    for (const w of wallets) {
      const result = resolveTransferAccounts(wallets, w.id);
      assert.strictEqual(result.sourceId, w.id);
      assert.notStrictEqual(result.targetId, result.sourceId);
    }
  });
});

test('Version 2.7.0 — WalletModal Color Palette Auto-Resolution', async (t) => {
  const PRESET_COLORS = [
    '#2563EB', '#1DC4F2', '#FF7900', '#16A34A',
    '#7C3AED', '#FF3366', '#FFE600', '#52B788',
  ];

  const resolveAvailableColor = (usedColors: string[]): string => {
    const usedSet = new Set(usedColors.map((c) => c.toLowerCase()));
    return PRESET_COLORS.find((c) => !usedSet.has(c.toLowerCase())) || PRESET_COLORS[0];
  };

  await t.test('sélectionne la première couleur de la palette si aucune n’est prise', () => {
    assert.strictEqual(resolveAvailableColor([]), '#2563EB');
  });

  await t.test('saute les couleurs déjà prises pour proposer directement une couleur libre', () => {
    // Si #2563EB et #1DC4F2 sont pris
    const used = ['#2563EB', '#1DC4F2'];
    assert.strictEqual(resolveAvailableColor(used), '#FF7900');
  });
});
