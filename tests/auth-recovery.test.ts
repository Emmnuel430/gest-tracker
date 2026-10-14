import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PasswordSchema,
  evaluatePasswordStrength,
  RequestPasswordResetSchema,
  VerifyPasswordResetOtpSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  RegisterSchema,
} from '../lib/validations';

describe('Password Policy & Strength Meter (v2.5.0 T1 & T2)', () => {
  it('valide un mot de passe conforme à la politique complète', () => {
    const validPasswords = [
      'Azerty123!',
      'SuperSecret#2026',
      'Abidjan_225$',
      'Wallet-Safe.99',
    ];

    for (const pwd of validPasswords) {
      const result = PasswordSchema.safeParse(pwd);
      assert.equal(result.success, true, `Échec sur mot de passe valide : ${pwd}`);
    }
  });

  it('rejette un mot de passe de moins de 8 caractères', () => {
    const result = PasswordSchema.safeParse('Ab1!xyz');
    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0]?.message || '', /8 caractères/i);
    }
  });

  it('rejette un mot de passe sans minuscule', () => {
    const result = PasswordSchema.safeParse('AZERTY123!');
    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0]?.message || '', /minuscule/i);
    }
  });

  it('rejette un mot de passe sans majuscule', () => {
    const result = PasswordSchema.safeParse('azerty123!');
    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0]?.message || '', /majuscule/i);
    }
  });

  it('rejette un mot de passe sans chiffre', () => {
    const result = PasswordSchema.safeParse('AzertySecret!');
    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0]?.message || '', /chiffre/i);
    }
  });

  it('rejette un mot de passe sans caractère spécial', () => {
    const result = PasswordSchema.safeParse('Azerty12345');
    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0]?.message || '', /spécial/i);
    }
  });

  it('évalue fidèlement le score 0 à 4 et les libellés de la jauge de robustesse', () => {
    // Vide
    const empty = evaluatePasswordStrength('');
    assert.equal(empty.score, 0);
    assert.equal(empty.label, 'Faible');
    assert.equal(empty.isValid, false);

    // 1 critère (longueur seule) -> Faible
    const lenOnly = evaluatePasswordStrength('abcdefgh');
    assert.equal(lenOnly.score, 1);
    assert.equal(lenOnly.label, 'Faible');
    assert.equal(lenOnly.isValid, false);

    // 2 critères (longueur + maj/min) -> Moyen
    const caseAndLen = evaluatePasswordStrength('Abcdefgh');
    assert.equal(caseAndLen.score, 2);
    assert.equal(caseAndLen.label, 'Moyen');
    assert.equal(caseAndLen.isValid, false);

    // 3 critères (longueur + maj/min + chiffre) -> Bon
    const withDigits = evaluatePasswordStrength('Abcdef12');
    assert.equal(withDigits.score, 3);
    assert.equal(withDigits.label, 'Bon');
    assert.equal(withDigits.isValid, false);

    // 4 critères (longueur + maj/min + chiffre + symbole) -> Robuste
    const full = evaluatePasswordStrength('Abcdef12!');
    assert.equal(full.score, 4);
    assert.equal(full.label, 'Robuste');
    assert.equal(full.isValid, true);
    assert.equal(full.hasMinLength, true);
    assert.equal(full.hasUppercase, true);
    assert.equal(full.hasLowercase, true);
    assert.equal(full.hasDigit, true);
    assert.equal(full.hasSymbol, true);
  });
});

describe('Password Recovery Schemas (v2.5.0 T3)', () => {
  it('RequestPasswordResetSchema valide un e-mail propre et normalise', () => {
    const valid = RequestPasswordResetSchema.safeParse({ email: 'USER@DOMAIN.COM' });
    assert.equal(valid.success, true);
    if (valid.success) {
      assert.equal(valid.data.email, 'user@domain.com');
    }

    const invalid = RequestPasswordResetSchema.safeParse({ email: 'pasunemail' });
    assert.equal(invalid.success, false);
  });

  it('VerifyPasswordResetOtpSchema valide un token strict de 6 chiffres', () => {
    const valid = VerifyPasswordResetOtpSchema.safeParse({
      email: 'test@example.com',
      token: '123456',
    });
    assert.equal(valid.success, true);

    const tooShort = VerifyPasswordResetOtpSchema.safeParse({
      email: 'test@example.com',
      token: '12345',
    });
    assert.equal(tooShort.success, false);

    const withLetters = VerifyPasswordResetOtpSchema.safeParse({
      email: 'test@example.com',
      token: '12345A',
    });
    assert.equal(withLetters.success, false);
  });

  it('ResetPasswordSchema valide le nouveau mot de passe et rejette les discordances', () => {
    const valid = ResetPasswordSchema.safeParse({
      password: 'NewStrongPassword#2026',
      confirmPassword: 'NewStrongPassword#2026',
    });
    assert.equal(valid.success, true);

    const mismatch = ResetPasswordSchema.safeParse({
      password: 'NewStrongPassword#2026',
      confirmPassword: 'DifferentPassword#2026',
    });
    assert.equal(mismatch.success, false);

    const weak = ResetPasswordSchema.safeParse({
      password: 'weak',
      confirmPassword: 'weak',
    });
    assert.equal(weak.success, false);
  });

  it('ChangePasswordSchema empêche de choisir le même mot de passe que l’ancien', () => {
    const identical = ChangePasswordSchema.safeParse({
      oldPassword: 'Password123!',
      newPassword: 'Password123!',
      confirmPassword: 'Password123!',
    });
    assert.equal(identical.success, false);
  });
});
