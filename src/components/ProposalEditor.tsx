import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import type { CompanyProfile, Proposal, ProposalContent } from '../types';
import PdfPreview from './PdfPreview';
import { buildPdfBlob, downloadBlob, pdfFileName } from '../lib/pdf';
import { normalizeHex, tint } from '../lib/color';

function AutoText({ value, onChange, className = '' }: { value: string; onChange: (v: string) => void; className?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
  }, [value]);
  return (
    <textarea
      ref={ref} rows={1} value={value} onChange={(e) => onChange(e.target.value)}
      className={`w-full resize-none overflow-hidden rounded border border-transparent bg-transparent px-2 py-1 leading-relaxed outline-none hover:border-slate-300 focus:border-brand-500 focus:bg-brand-50/40 dark:hover:border-slate-600 dark:focus:bg-slate-800 ${className}`}
    />
  );
}

interface Props {
  proposal: Proposal;
  company: CompanyProfile;
  onChange: (p: Proposal) => void;
  onIssue: (p: Proposal) => void;
  onBack: () => void;
}

export default function ProposalEditor({ proposal, company, onChange, onIssue, onBack }: Props) {
  const [busy, setBusy] = useState(false);
  const c = proposal.content;
  const accent = normalizeHex(company.primaryColor);
  const setC = (patch: Partial<ProposalContent>) => onChange({ ...proposal, content: { ...c, ...patch } });
  const lines = (t: string) => t.split('\n');

  const download = async () => {
    setBusy(true);
    try {
      const blob = await buildPdfBlob(proposal, company);
      downloadBlob(blob, pdfFileName(proposal));
      onIssue(proposal);
    } catch (e) {
      alert('Erro ao gerar PDF: ' + (e instanceof Error ? e.message : e));
    } finally {
      setBusy(false);
    }
  };

  const Section = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
    <div className="mb-5">
      <h4
        className="mb-1 border-b pb-1 text-sm font-bold uppercase tracking-wide"
        style={{ color: accent, borderColor: tint(accent, 0.75) }}
      >{n}. {title}</h4>
      {children}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button className="mb-1 flex items-center gap-1 text-sm text-slate-500 hover:underline" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Editar dados / regenerar</button>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Proposta</h2>
            <input
              aria-label="Número da proposta" className="input w-48 font-mono text-base font-semibold"
              value={proposal.number} onChange={(e) => onChange({ ...proposal, number: e.target.value })}
            />
          </div>
          <p className="text-xs text-slate-500">Edite qualquer texto abaixo – salvo automaticamente; o PDF atualiza em seguida.</p>
        </div>
        <button className="btn-primary" onClick={download} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Baixar Proposta em PDF
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-6 text-sm">
          <div className="mb-5 border-b-2 pb-3" style={{ borderColor: accent }}>
            <div className="flex items-center justify-between gap-4">
              {company.logo ? <img src={company.logo} alt="Logo" className="max-h-12 max-w-32 object-contain" /> : <b className="text-lg" style={{ color: accent }}>{company.name || 'Sua Empresa'}</b>}
              <span className="text-right text-xs text-slate-500">{[company.cnpj, company.phone, company.email].filter(Boolean).join(' | ')}</span>
            </div>
          </div>
          <div className="mb-4 border-l-4 pl-3" style={{ borderColor: accent }}>
            <h3 className="text-2xl font-bold" style={{ color: accent }}>Proposta Comercial</h3>
            <p className="text-slate-500">{proposal.input.projectType} • {proposal.input.clientName}</p>
          </div>

          <Section n={1} title="Objetivo do Projeto"><AutoText value={c.objetivo} onChange={(v) => setC({ objetivo: v })} /></Section>
          <Section n={2} title="Escopo Detalhado das Entregas">
            <p className="px-2 text-xs text-slate-400">Um item por linha</p>
            <AutoText value={c.escopo.join('\n')} onChange={(v) => setC({ escopo: lines(v) })} />
          </Section>
          <Section n={3} title="Limites de Escopo (O que NÃO está incluso)">
            <p className="px-2 text-xs text-slate-400">Um item por linha</p>
            <AutoText value={c.limites.join('\n')} onChange={(v) => setC({ limites: lines(v) })} />
          </Section>
          <Section n={4} title="Termos de SLA & Prazos"><AutoText value={c.sla} onChange={(v) => setC({ sla: v })} /></Section>
          <Section n={5} title="Condições Comerciais & Investimento"><AutoText value={c.condicoes} onChange={(v) => setC({ condicoes: v })} /></Section>
        </div>

        <div className="xl:sticky xl:top-20 xl:h-[calc(100vh-7rem)]">
          <PdfPreview proposal={proposal} company={company} />
        </div>
      </div>
    </div>
  );
}
