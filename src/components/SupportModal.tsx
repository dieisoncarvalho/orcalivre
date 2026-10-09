import { useEffect, useState } from 'react';
import { Check, Coffee, Copy, Heart, X } from 'lucide-react';
import { SUPPORT } from '../config/support';

export default function SupportModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT.pixKey);
    } catch {
      // Fallback para contextos sem Clipboard API
      const ta = document.createElement('textarea');
      ta.value = SUPPORT.pixKey;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-title"
    >
      <div className="card relative w-full max-w-md space-y-4 p-6" onClick={(e) => e.stopPropagation()}>
        <button className="absolute right-3 top-3 rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" onClick={onClose} aria-label="Fechar">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-rose-100 p-3 text-rose-600 dark:bg-rose-950 dark:text-rose-400"><Heart className="h-6 w-6" /></div>
          <h2 id="support-title" className="text-lg font-bold">Apoie o OrçaLivre</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Se o OrçaLivre te ajudou a fechar contratos ou economizar tempo, considere apoiar o desenvolvimento!
        </p>
        <div>
          <label className="label" htmlFor="pix">Chave PIX</label>
          <div className="flex gap-2">
            <input id="pix" readOnly className="input font-mono text-xs" value={SUPPORT.pixKey} onFocus={(e) => e.currentTarget.select()} />
            <button className="btn-primary shrink-0" onClick={copy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copiada!' : 'Copiar Chave'}
            </button>
          </div>
        </div>
        {SUPPORT.coffeeUrl && (
          <a className="btn-ghost w-full" href={SUPPORT.coffeeUrl} target="_blank" rel="noopener noreferrer">
            <Coffee className="h-4 w-4" /> Apoie com um café
          </a>
        )}
        <p className="text-center text-xs text-slate-400">Obrigado! — {SUPPORT.author}</p>
      </div>
    </div>
  );
}
