import type { NumberingSettings } from '../types';

/** Redimensiona e converte a logo para PNG (Base64) – PNG é suportado pelo react-pdf. */
export function fileToLogoDataUrl(file: File, maxSize = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Arquivo não é uma imagem.'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler a imagem.'));
    };
    img.src = url;
  });
}

export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));

export function defaultNumbering(existing: { number: string }[] = []): NumberingSettings {
  const prefix = `PP-${new Date().getFullYear()}-`;
  // Migração: continua depois do maior número já usado com este prefixo.
  const max = existing.reduce((m, p) => {
    if (!p.number.startsWith(prefix)) return m;
    const n = parseInt(p.number.slice(prefix.length), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return { mode: 'auto', prefix, next: max + 1, digits: 4 };
}

export const formatNumber = (n: NumberingSettings, index: number = n.next) =>
  n.prefix + String(index).padStart(n.digits, '0');

/** Sugere o próximo número livre (pula os já existentes). */
export function suggestNumber(n: NumberingSettings, existing: { number: string }[]): { text: string; index: number } {
  const taken = new Set(existing.map((p) => p.number.trim().toLowerCase()));
  let i = Math.max(0, n.next);
  while (taken.has(formatNumber(n, i).toLowerCase())) i++;
  return { text: formatNumber(n, i), index: i };
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
