import type { CompanyProfile, NumberingSettings, PricingField, Proposal, ProposalInput, Settings } from '../types';

const P = 'orcalivre:';
const LEGACY_P = 'propostapro:';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(P + key) ?? localStorage.getItem(LEGACY_P + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(P + key, JSON.stringify(value));
  } catch (e) {
    alert('Não foi possível salvar no navegador (armazenamento cheio?). Exporte/limpe o histórico.');
    console.error(e);
  }
}

export const emptyCompany: CompanyProfile = {
  name: '', cnpj: '', phone: '', email: '', address: '', primaryColor: '#1E40AF',
  defaultTerms:
    'Esta proposta tem validade de 15 dias. Alterações de escopo serão tratadas via aditivo contratual. Valores não incluem impostos quando aplicáveis.',
};

export const defaultSettings: Settings = {
  provider: 'gemini',
  geminiKey: '', geminiModel: 'gemini-2.5-flash',
  openaiKey: '', openaiModel: 'gpt-4o-mini',
};

export const DEFAULT_PROJECT_TYPES: string[] = [
  'Suporte Mensal',
  'Implantação de Redes',
  'Firewall/Segurança',
  'Consultoria',
  'CFTV',
  'Venda de Equipamentos',
  'Cabeamento Estruturado',
];

export const createDefaultPricingFields = (): PricingField[] => [
  { id: 'pf-1', label: 'Valor de Implantação / Produtos', value: '' },
  { id: 'pf-2', label: 'Mensalidade', value: '' },
  { id: 'pf-3', label: 'Prazo de Vigência', value: '12 meses' },
  { id: 'pf-4', label: 'Forma de Faturamento', value: 'Boleto / PIX todo dia 10' },
];

export function normalizePricingFields(input?: Partial<ProposalInput>): PricingField[] {
  if (!input) return createDefaultPricingFields();
  if (Array.isArray(input.pricingFields) && input.pricingFields.length > 0) {
    return input.pricingFields;
  }
  const fields: PricingField[] = [];
  if (input.priceUpfront !== undefined) {
    fields.push({ id: 'pf-1', label: 'Valor de Implantação / Produtos', value: input.priceUpfront || '' });
  }
  if (input.priceMonthly !== undefined) {
    fields.push({ id: 'pf-2', label: 'Mensalidade', value: input.priceMonthly || '' });
  }
  if (input.validity !== undefined) {
    fields.push({ id: 'pf-3', label: 'Prazo de Vigência', value: input.validity || '' });
  }
  if (input.billing !== undefined) {
    fields.push({ id: 'pf-4', label: 'Forma de Faturamento', value: input.billing || '' });
  }
  if (input.paymentTerms !== undefined && input.paymentTerms.trim()) {
    fields.push({ id: 'pf-5', label: 'Condições de Pagamento', value: input.paymentTerms || '' });
  }
  return fields.length > 0 ? fields : createDefaultPricingFields();
}

export const emptyInput: ProposalInput = {
  clientName: '', clientContact: '', clientEmail: '',
  projectType: 'Suporte Mensal', notes: '',
  pricingFields: createDefaultPricingFields(),
  slaCritical: '2 horas', slaNormal: '8 horas úteis', slaMode: 'Remoto + Presencial',
};

export const storage = {
  getCompany: () => ({ ...emptyCompany, ...read<Partial<CompanyProfile>>('company', {}) }),
  setCompany: (c: CompanyProfile) => write('company', c),
  getSettings: () => ({ ...defaultSettings, ...read<Partial<Settings>>('settings', {}) }),
  setSettings: (s: Settings) => write('settings', s),
  getProjectTypes: () => read<string[]>('project_types', DEFAULT_PROJECT_TYPES),
  setProjectTypes: (types: string[]) => write('project_types', types),
  getProposals: () => {
    const list = read<Proposal[]>('proposals', []);
    return list.map((p) => ({
      ...p,
      input: {
        ...p.input,
        pricingFields: normalizePricingFields(p.input),
      },
    }));
  },
  getNumbering: () => read<NumberingSettings | null>('numbering', null),
  setNumbering: (n: NumberingSettings) => write('numbering', n),
  setProposals: (p: Proposal[]) => write('proposals', p),
  getLicense: () => read<string>('license', ''),
  setLicense: (t: string) => write('license', t),
  clearLicense: () => localStorage.removeItem(P + 'license'),
  getTheme: () => (localStorage.getItem(P + 'theme') as 'dark' | 'light' | null),
  setTheme: (t: 'dark' | 'light') => localStorage.setItem(P + 'theme', t),
};
