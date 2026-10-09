export const DEFAULT_COLOR = '#1E40AF';

export const PALETTE: { name: string; hex: string }[] = [
  { name: 'Azul Executivo', hex: '#1E40AF' },
  { name: 'Cinzento Grafite', hex: '#374151' },
  { name: 'Verde Escuro', hex: '#065F46' },
  { name: 'Roxo', hex: '#5B21B6' },
  { name: 'Bordô', hex: '#881337' },
];

export const isValidHex = (v: string) => /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());

/** Normaliza para #RRGGBB maiúsculo; cai no padrão se inválido. */
export function normalizeHex(v?: string): string {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((v ?? '').trim());
  if (!m) return DEFAULT_COLOR;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return '#' + h.toUpperCase();
}

function rgb(hex: string): [number, number, number] {
  const h = normalizeHex(hex).slice(1);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Mistura a cor com branco (amount 0..1 = quanto de branco). */
export function tint(hex: string, amount: number): string {
  const out = rgb(hex).map((c) => Math.round(c + (255 - c) * amount));
  return '#' + out.map((c) => c.toString(16).padStart(2, '0')).join('');
}

/** Texto legível (claro/escuro) sobre um fundo da cor dada. */
export function contrastText(hex: string): string {
  const [r, g, b] = rgb(hex);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? '#0F172A' : '#FFFFFF';
}

export interface PdfTheme {
  accent: string;
  soft: string; // fundo suave (rótulos, linhas alternadas)
  line: string; // divisórias suaves
  onAccent: string; // texto sobre accent
}

export function buildTheme(color?: string): PdfTheme {
  const accent = normalizeHex(color);
  return { accent, soft: tint(accent, 0.92), line: tint(accent, 0.8), onAccent: contrastText(accent) };
}
