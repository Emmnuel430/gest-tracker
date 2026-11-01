import test from 'node:test';
import assert from 'node:assert';
import {
  evaluateSessionPolicy,
  encodeSignedSession,
  decodeAndVerifySession,
  SESSION_IDLE_TIMEOUT_MS,
  REMEMBER_ME_MAX_AGE_MS,
  ACTIVITY_REFRESH_THROTTLE_MS,
} from '../lib/session-policy';

test('Politique de Session & Se Souvenir de Moi (Sprint 2.15.0)', async (t) => {
  await t.test('evaluateSessionPolicy: session standard (remember = false)', () => {
    const now = 1700000000000;

    // Activité récente (30s) -> VALID
    assert.strictEqual(
      evaluateSessionPolicy(
        {
          remember: false,
          issuedAt: now - 100000,
          lastActivityAt: now - 30000,
        },
        now
      ),
      'VALID'
    );

    // Activité > 60s (ex: 2 min) mais < 15 min -> VALID_REFRESH
    assert.strictEqual(
      evaluateSessionPolicy(
        {
          remember: false,
          issuedAt: now - 200000,
          lastActivityAt: now - ACTIVITY_REFRESH_THROTTLE_MS - 1000,
        },
        now
      ),
      'VALID_REFRESH'
    );

    // Activité exacte à 14m59s -> VALID_REFRESH
    assert.strictEqual(
      evaluateSessionPolicy(
        {
          remember: false,
          issuedAt: now - 1000000,
          lastActivityAt: now - (SESSION_IDLE_TIMEOUT_MS - 1000),
        },
        now
      ),
      'VALID_REFRESH'
    );

    // Inactivité > 15 min -> EXPIRED_IDLE
    assert.strictEqual(
      evaluateSessionPolicy(
        {
          remember: false,
          issuedAt: now - 2000000,
          lastActivityAt: now - (SESSION_IDLE_TIMEOUT_MS + 1000),
        },
        now
      ),
      'EXPIRED_IDLE'
    );
  });

  await t.test('evaluateSessionPolicy: session persistante (remember = true)', () => {
    const now = 1700000000000;

    // Même après 5 jours sans activité, la session reste valide car remember=true
    assert.strictEqual(
      evaluateSessionPolicy(
        {
          remember: true,
          issuedAt: now - 5 * 24 * 60 * 60 * 1000,
          lastActivityAt: now - 5 * 24 * 60 * 60 * 1000,
        },
        now
      ),
      'VALID'
    );

    // Session à 29 jours -> VALID
    assert.strictEqual(
      evaluateSessionPolicy(
        {
          remember: true,
          issuedAt: now - (REMEMBER_ME_MAX_AGE_MS - 24 * 60 * 60 * 1000),
          lastActivityAt: now - (REMEMBER_ME_MAX_AGE_MS - 24 * 60 * 60 * 1000),
        },
        now
      ),
      'VALID'
    );

    // Session > 30 jours -> EXPIRED_MAX_AGE
    assert.strictEqual(
      evaluateSessionPolicy(
        {
          remember: true,
          issuedAt: now - (REMEMBER_ME_MAX_AGE_MS + 1000),
          lastActivityAt: now - 1000,
        },
        now
      ),
      'EXPIRED_MAX_AGE'
    );
  });

  await t.test('Signature et vérification cryptographique HMAC-SHA256', async () => {
    const payload = {
      userId: 'user-uuid-123',
      remember: true,
      issuedAt: Date.now(),
      lastActivityAt: Date.now(),
    };

    const token = await encodeSignedSession(payload);
    assert.ok(token.includes('.'), 'Le jeton doit contenir un séparateur de signature');

    const decoded = await decodeAndVerifySession(token);
    assert.ok(decoded, 'Le jeton valide doit être déchiffré');
    assert.strictEqual(decoded?.userId, 'user-uuid-123');
    assert.strictEqual(decoded?.remember, true);

    // Signature altérée
    const parts = token.split('.');
    const corruptedToken = `${parts[0]}.00112233445566778899aabbccddeeff`;
    const corruptedDecoded = await decodeAndVerifySession(corruptedToken);
    assert.strictEqual(corruptedDecoded, null, 'Un jeton à signature altérée doit retourner null');

    // Payload altéré
    const fakePayload = Buffer.from(
      JSON.stringify({ ...payload, userId: 'hacker' }),
      'utf8'
    ).toString('base64url');
    const hijackedToken = `${fakePayload}.${parts[1]}`;
    const hijackedDecoded = await decodeAndVerifySession(hijackedToken);
    assert.strictEqual(hijackedDecoded, null, 'Un jeton au payload falsifié doit retourner null');
  });
});
