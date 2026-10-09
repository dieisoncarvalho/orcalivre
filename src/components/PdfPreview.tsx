import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { CompanyProfile, Proposal } from '../types';
import { buildPdfBlob } from '../lib/pdf';

/** Visualizador de PDF embutido: renderiza o PDF vetorial e exibe via viewer nativo do navegador. */
export default function PdfPreview({ proposal, company }: { proposal: Proposal; company: CompanyProfile }) {
  const [url, setUrl] = useState<string>('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let created = '';
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const blob = await buildPdfBlob(proposal, company);
        if (cancelled) return;
        created = URL.createObjectURL(blob);
        setUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return created;
        });
        setError('');
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Falha ao renderizar PDF');
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 700);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [proposal, company]);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative h-full min-h-[600px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
      {url && <iframe title="Pré-visualização do PDF" src={url} className="h-full w-full" />}
      {busy && (
        <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs shadow dark:bg-slate-900/90">
          <Loader2 className="h-3 w-3 animate-spin" /> Renderizando PDF…
        </div>
      )}
      {error && <div className="p-4 text-sm text-red-600">Erro no PDF: {error}</div>}
    </div>
  );
}
