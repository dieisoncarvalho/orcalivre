export interface CompanyProfile {
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  defaultTerms: string;
  logo?: string; // data URL (PNG)
  primaryColor: string; // #RRGGBB – cor de destaque do PDF
}

export interface NumberingSettings {
  mode: 'auto' | 'manual';
  prefix: string; // ex.: "PP-2026-"
  next: number; // próximo índice sugerido
  digits: number; // zeros à esquerda (ex.: 4 => 0001)
}

export interface PricingField {
  id: string;
  label: string;
  value: string;
}

export interface ProposalInput {
  clientName: string;
  clientContact: string;
  clientEmail: string;
  projectType: string;
  notes: string;
  pricingFields: PricingField[];
  // Campos legados mantidos para compatibilidade com propostas antigas
  priceUpfront?: string;
  priceMonthly?: string;
  validity?: string;
  billing?: string;
  paymentTerms?: string;
  slaCritical: string;
  slaNormal: string;
  slaMode: 'Remoto' | 'Presencial' | 'Remoto + Presencial';
}

export interface ProposalContent {
  objetivo: string;
  escopo: string[];
  limites: string[];
  sla: string;
  condicoes: string;
}

export interface Proposal {
  id: string;
  number: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'issued';
  input: ProposalInput;
  content: ProposalContent;
}

export interface Settings {
  provider: 'gemini' | 'openai';
  geminiKey: string;
  geminiModel: string;
  openaiKey: string;
  openaiModel: string;
}

export interface LicensePayload {
  sub: string; // e-mail / identificador
  iat: number; // emitida em (epoch s)
  exp?: number; // expiração opcional (epoch s)
  v: 1;
}
