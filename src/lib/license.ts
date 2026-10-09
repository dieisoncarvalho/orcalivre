import nacl from 'tweetnacl';
import type { LicensePayload } from '../types';
import { LICENSE_PUBLIC_KEY_B64 } from '../config/publicKey';

/**
 * Formato da chave de ativação:  PP1.<payloadBase64Url>.<assinaturaBase64Url>
 * - payload: JSON { sub, iat, exp?, v:1 }
 * - assinatura: Ed25519 sobre os bytes ASCII da string <payloadBase64Url>
 * Somente a chave pública está embutida no app; a privada fica com o administrador.
 */

function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export type LicenseResult =
  | { valid: true; payload: LicensePayload }
  | { valid: false; reason: string };

export function verifyLicense(token: string): LicenseResult {
  try {
    const clean = token.replace(/\s+/g, '');
    const parts = clean.split('.');
    if (parts.length !== 3 || parts[0] !== 'PP1') return { valid: false, reason: 'Formato de chave inválido.' };
    const [, payloadB64, sigB64] = parts;

    const pub = Uint8Array.from(atob(LICENSE_PUBLIC_KEY_B64), (c) => c.charCodeAt(0));
    if (pub.length !== 32) return { valid: false, reason: 'Chave pública do app não configurada (rode license:init).' };

    const msg = new TextEncoder().encode(payloadB64);
    const sig = b64urlToBytes(sigB64);
    if (!nacl.sign.detached.verify(msg, sig, pub)) return { valid: false, reason: 'Assinatura inválida.' };

    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(payloadB64))) as LicensePayload;
    if (payload.v !== 1 || !payload.sub) return { valid: false, reason: 'Conteúdo da licença inválido.' };
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return { valid: false, reason: 'Licença expirada.' };
    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'Chave malformada.' };
  }
}
