/**
 * Gestionnaire de politique de session pour Gest Tracker.
 * - Sessions standard : expiration après 15 minutes d'inactivité glissante.
 * - Sessions 'Se souvenir de moi' : validité 30 jours calendaires depuis l'émission.
 * - Signature HMAC-SHA256 via Web Crypto API (compatible Middleware Next.js & Server Actions).
 */

export const SESSION_COOKIE_NAME = 'gt_session';
export const SESSION_IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
export const REMEMBER_ME_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours
export const ACTIVITY_REFRESH_THROTTLE_MS = 60 * 1000; // 1 minute

export interface SessionPayload {
  userId: string;
  remember: boolean;
  issuedAt: number; // timestamp en millisecondes
  lastActivityAt: number; // timestamp en millisecondes
}

export type SessionEvaluation =
  | 'VALID'
  | 'VALID_REFRESH'
  | 'EXPIRED_IDLE'
  | 'EXPIRED_MAX_AGE';

/**
 * Évalue la validité d'une session par rapport à l'heure actuelle.
 */
export function evaluateSessionPolicy(
  session: Pick<SessionPayload, 'remember' | 'issuedAt' | 'lastActivityAt'>,
  now = Date.now()
): SessionEvaluation {
  if (session.remember) {
    if (now - session.issuedAt > REMEMBER_ME_MAX_AGE_MS) {
      return 'EXPIRED_MAX_AGE';
    }
    return 'VALID';
  }

  // Session sans mémorisation : inactivité de 15 minutes
  if (now - session.lastActivityAt > SESSION_IDLE_TIMEOUT_MS) {
    return 'EXPIRED_IDLE';
  }

  // Si l'inactivité est valide mais que plus de 60s se sont écoulées, rafraîchir
  if (now - session.lastActivityAt >= ACTIVITY_REFRESH_THROTTLE_MS) {
    return 'VALID_REFRESH';
  }

  return 'VALID';
}

function getSecretKey(): string {
  return (
    process.env.SESSION_COOKIE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'gest-tracker-dev-secret-key-32-chars-minimum!'
  );
}

// Convertit un ArrayBuffer en chaîne hexadécimale
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

// Convertit une chaîne hexadécimale en ArrayBuffer
function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const secret = getSecretKey();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Encode et signe un payload de session sous forme de jeton 'payload.signature'.
 */
export async function encodeSignedSession(payload: SessionPayload): Promise<string> {
  const jsonStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonStr, 'utf8').toString('base64url');
  
  const key = await getCryptoKey();
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(base64Payload)
  );
  
  const signatureHex = bufferToHex(signatureBuffer);
  return `${base64Payload}.${signatureHex}`;
}

/**
 * Décode et vérifie l'intégrité cryptographique d'un jeton de session.
 * Retourne null si la signature est invalide ou corrompue.
 */
export async function decodeAndVerifySession(token: string): Promise<SessionPayload | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [base64Payload, signatureHex] = parts;
  if (!base64Payload || !signatureHex) return null;

  try {
    const key = await getCryptoKey();
    const encoder = new TextEncoder();
    const signatureBuffer = hexToBuffer(signatureHex);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      encoder.encode(base64Payload)
    );

    if (!isValid) return null;

    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf8');
    const parsed = JSON.parse(jsonStr) as SessionPayload;

    if (
      !parsed.userId ||
      typeof parsed.remember !== 'boolean' ||
      typeof parsed.issuedAt !== 'number' ||
      typeof parsed.lastActivityAt !== 'number'
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
