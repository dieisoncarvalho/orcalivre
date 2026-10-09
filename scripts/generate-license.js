#!/usr/bin/env node
/**
 * Gerador de licenças offline do PropostaPro (Ed25519).
 *
 *   node scripts/generate-license.js init                      -> gera par de chaves (uma única vez)
 *   node scripts/generate-license.js <email|id> [--days 365]   -> emite chave de ativação
 *
 * A chave PRIVADA fica em scripts/.keys/private.pem (NUNCA commitar / publicar).
 * A chave PÚBLICA é gravada em src/config/publicKey.ts e embutida no build.
 * Alternativa à chave em arquivo: variável de ambiente LICENSE_PRIVATE_KEY_PEM.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keysDir = path.join(__dirname, '.keys');
const privPath = path.join(keysDir, 'private.pem');
const pubTsPath = path.join(__dirname, '..', 'src', 'config', 'publicKey.ts');

const b64url = (buf) => Buffer.from(buf).toString('base64url');

function init() {
  if (fs.existsSync(privPath) && !process.argv.includes('--force')) {
    console.error(`Já existe uma chave privada em ${privPath}.\nUse --force para sobrescrever (invalida TODAS as licenças já emitidas).`);
    process.exit(1);
  }
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  fs.mkdirSync(keysDir, { recursive: true });
  fs.writeFileSync(privPath, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
  const rawPub = Buffer.from(publicKey.export({ format: 'jwk' }).x, 'base64url').toString('base64');
  fs.mkdirSync(path.dirname(pubTsPath), { recursive: true });
  fs.writeFileSync(
    pubTsPath,
    `// Gerado/atualizado por \`npm run license:init\`. Contém APENAS a chave pública Ed25519 (32 bytes, Base64).\nexport const LICENSE_PUBLIC_KEY_B64 = '${rawPub}';\n`,
  );
  console.log('✔ Par de chaves gerado.');
  console.log(`  Privada : ${privPath}  (GUARDE EM LOCAL SEGURO / BACKUP)`);
  console.log(`  Pública : ${pubTsPath}`);
  console.log('  Refaça o build do app (npm run build) para embutir a chave pública.');
}

function loadPrivateKey() {
  const pem = process.env.LICENSE_PRIVATE_KEY_PEM || (fs.existsSync(privPath) ? fs.readFileSync(privPath, 'utf8') : null);
  if (!pem) {
    console.error('Chave privada não encontrada. Rode primeiro: node scripts/generate-license.js init');
    process.exit(1);
  }
  return crypto.createPrivateKey(pem);
}

function issue(subject, days) {
  const now = Math.floor(Date.now() / 1000);
  const payload = { sub: subject, iat: now, v: 1 };
  if (days) payload.exp = now + days * 86400;
  const payloadB64 = b64url(JSON.stringify(payload));
  const sig = crypto.sign(null, Buffer.from(payloadB64), loadPrivateKey());
  return `PP1.${payloadB64}.${b64url(sig)}`;
}

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log('Uso:\n  node scripts/generate-license.js init [--force]\n  node scripts/generate-license.js <email|identificador> [--days N]');
  process.exit(0);
}
if (args[0] === 'init') {
  init();
} else {
  const subject = args[0].trim().toLowerCase();
  const di = args.indexOf('--days');
  const days = di >= 0 ? parseInt(args[di + 1], 10) : 0;
  if (di >= 0 && !(days > 0)) {
    console.error('--days precisa de um número inteiro positivo.');
    process.exit(1);
  }
  console.log(`\nLicença para: ${subject}${days ? ` (válida por ${days} dias)` : ' (vitalícia)'}\n`);
  console.log(issue(subject, days));
  console.log();
}
