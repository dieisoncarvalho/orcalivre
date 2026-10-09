import { Copy, FileDown, FileText, Pencil, Trash2 } from 'lucide-react';
import type { CompanyProfile, Proposal } from '../types';
import { fmtDateTime } from '../lib/utils';
import { buildPdfBlob, downloadBlob, pdfFileName } from '../lib/pdf';

interface Props {
  proposals: Proposal[];
  company: CompanyProfile;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export default function History({ proposals, company, onEdit, onDuplicate, onDelete, onNew }: Props) {
  const reissue = async (p: Proposal) => {
    try {
      downloadBlob(await buildPdfBlob(p, company), pdfFileName(p));
    } catch (e) {
      alert('Erro ao gerar PDF: ' + (e instanceof Error ? e.message : e));
    }
  };

  if (!proposals.length)
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <FileText className="mx-auto mb-3 h-10 w-10 text-slate-400" />
        <p className="mb-4 text-slate-500">Nenhuma proposta criada ainda.</p>
        <button className="btn-primary" onClick={onNew}>Criar primeira proposta</button>
      </div>
    );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Histórico</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="p-3">Nº</th><th className="p-3">Cliente</th><th className="p-3">Tipo</th>
              <th className="p-3">Status</th><th className="p-3">Atualizada</th><th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="p-3 font-mono text-xs">{p.number}</td>
                <td className="p-3 font-medium">{p.input.clientName}</td>
                <td className="p-3">{p.input.projectType}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === 'issued' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {p.status === 'issued' ? 'Emitida' : 'Rascunho'}
                  </span>
                </td>
                <td className="p-3 text-slate-500">{fmtDateTime(p.updatedAt)}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <button title="Editar" className="btn-ghost px-2 py-1" onClick={() => onEdit(p.id)}><Pencil className="h-4 w-4" /></button>
                    <button title="Duplicar" className="btn-ghost px-2 py-1" onClick={() => onDuplicate(p.id)}><Copy className="h-4 w-4" /></button>
                    <button title="Reemitir PDF" className="btn-ghost px-2 py-1" onClick={() => reissue(p)}><FileDown className="h-4 w-4" /></button>
                    <button title="Excluir" className="btn-danger px-2 py-1" onClick={() => confirm(`Excluir ${p.number}?`) && onDelete(p.id)}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
