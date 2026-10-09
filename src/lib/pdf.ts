import { createElement } from 'react';
import type { CompanyProfile, Proposal } from '../types';

/** react-pdf é carregado sob demanda (code-splitting) para manter o bundle inicial leve. */
export async function buildPdfBlob(proposal: Proposal, company: CompanyProfile): Promise<Blob> {
  const [{ pdf }, { ProposalDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('../components/ProposalPDF'),
  ]);
  return pdf(createElement(ProposalDocument, { proposal, company }) as never).toBlob();
}

export function pdfFileName(p: Proposal): string {
  const slug = p.input.clientName
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return `Proposta-${p.number}${slug ? '-' + slug : ''}.pdf`;
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
