import { useState } from 'react';
import { Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import type { CompanyProfile, NumberingSettings, PricingField, ProposalContent, ProposalInput, Settings } from '../types';
import { emptyInput, normalizePricingFields } from '../lib/storage';
import { PROVIDER_LABEL, activeCreds, aiErrorMessage, generateProposal } from '../lib/ai';

interface Props {
  initial?: ProposalInput;
  initialNumber?: string;
  numbering: NumberingSettings;
  suggestedNumber: string;
  takenNumbers: string[]; // já normalizados (trim + lowercase)
  projectTypes: string[];
  company: CompanyProfile;
  settings: Settings;
  onGenerated: (input: ProposalInput, content: ProposalContent, number: string) => void;
  onGoSettings: () => void;
}

export default function ProposalForm({
  initial,
  initialNumber,
  numbering,
  suggestedNumber,
  takenNumbers,
  projectTypes,
  company,
  settings,
  onGenerated,
  onGoSettings,
}: Props) {
  const [f, setF] = useState<ProposalInput>(() => {
    if (initial) {
      return {
        ...initial,
        pricingFields: normalizePricingFields(initial),
      };
    }
    return emptyInput;
  });

  const isAuto = numbering.mode === 'auto';
  const [number, setNumber] = useState(initialNumber ?? (isAuto ? suggestedNumber : ''));
  const duplicated = takenNumbers.includes(number.trim().toLowerCase());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof ProposalInput>(k: K, v: ProposalInput[K]) => setF((p) => ({ ...p, [k]: v }));
  const txt = (k: keyof ProposalInput) => ({
    className: 'input',
    value: f[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value as never),
  });

  const pricingFields = f.pricingFields || [];

  const updatePricingField = (id: string, key: 'label' | 'value', val: string) => {
    const updated = pricingFields.map((pf) => (pf.id === id ? { ...pf, [key]: val } : pf));
    set('pricingFields', updated);
  };

  const removePricingField = (id: string) => {
    const updated = pricingFields.filter((pf) => pf.id !== id);
    set('pricingFields', updated);
  };

  const addPricingField = () => {
    const newField: PricingField = {
      id: 'pf-' + Math.random().toString(36).slice(2, 9),
      label: 'Novo Campo / Condição',
      value: '',
    };
    set('pricingFields', [...pricingFields, newField]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number.trim()) return setError('Informe o número da proposta.');
    if (!activeCreds(settings).key) return setError(`Configure sua API Key (${PROVIDER_LABEL[settings.provider]}) em Configurações.`);
    setLoading(true);
    setError('');
    try {
      const content = await generateProposal(settings, f, company);
      onGenerated(f, content, number.trim());
    } catch (err) {
      setError(aiErrorMessage(settings.provider, err));
    } finally {
      setLoading(false);
    }
  };

  const isCustomType = !projectTypes.includes(f.projectType);

  return (
    <form onSubmit={submit} className="mx-auto max-w-4xl space-y-6">
      <h2 className="text-2xl font-bold">{initial ? 'Editar dados da proposta' : 'Nova proposta'}</h2>

      {!activeCreds(settings).key && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Falta configurar a API Key de {PROVIDER_LABEL[settings.provider]}.{' '}
          <button type="button" className="font-semibold underline" onClick={onGoSettings}>Abrir configurações</button>
        </div>
      )}

      <section className="card grid items-end gap-4 p-6 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="label" htmlFor="pnum">Nº da proposta *</label>
          <input
            id="pnum"
            required
            className="input font-mono"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder={isAuto ? '' : 'Digite o número (ex.: ORC-2026/15)'}
          />
        </div>
        <div className="space-y-1 text-xs text-slate-500 sm:col-span-2">
          <p>
            Numeração <b>{isAuto ? 'automática' : 'manual'}</b> (altere em Configurações). Você pode ajustar o número antes de gerar; ele também pode ser editado depois, no editor.
          </p>
          {isAuto && number !== suggestedNumber && (
            <button type="button" className="font-semibold text-brand-600 underline" onClick={() => setNumber(suggestedNumber)}>
              Usar sugerido: {suggestedNumber}
            </button>
          )}
          {duplicated && <p className="font-semibold text-amber-600">Atenção: já existe uma proposta com este número.</p>}
        </div>
      </section>

      <section className="card grid gap-4 p-6 sm:grid-cols-3">
        <h3 className="font-semibold sm:col-span-3">Cliente</h3>
        <div><label className="label">Nome / Empresa *</label><input required {...txt('clientName')} /></div>
        <div><label className="label">Contato</label><input {...txt('clientContact')} /></div>
        <div><label className="label">E-mail</label><input type="email" {...txt('clientEmail')} /></div>
      </section>

      <section className="card space-y-4 p-6">
        <h3 className="font-semibold">Projeto</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Tipo de projeto</label>
            <select
              className="input"
              value={isCustomType ? 'Outro' : f.projectType}
              onChange={(e) => set('projectType', e.target.value === 'Outro' ? '' : e.target.value)}
            >
              {projectTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              <option value="Outro">Outro (digitar na hora)</option>
            </select>
          </div>
          {(isCustomType || !f.projectType) && (
            <div>
              <label className="label">Descreva o tipo de projeto *</label>
              <input required placeholder="Ex.: Manutenção Preventiva..." {...txt('projectType')} />
            </div>
          )}
        </div>
        <div>
          <label className="label">Anotações brutas / escopo livre</label>
          <textarea rows={8} placeholder="Cole aqui notas rápidas, conversa do WhatsApp, requisitos levantados em reunião…" {...txt('notes')} />
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">Valores, Condições e Prazos</h3>
            <p className="text-xs text-slate-500">
              Campos 100% dinâmicos. Altere os rótulos, ajuste os valores ou adicione novos itens comerciais.
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={addPricingField}
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar Campo / Condição
          </button>
        </div>

        <div className="space-y-3">
          {pricingFields.map((field) => (
            <div
              key={field.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div className="sm:w-2/5">
                <label className="label text-[10px]">Rótulo / Nome da Condição</label>
                <input
                  className="input font-medium"
                  value={field.label}
                  placeholder="Nome do campo..."
                  onChange={(e) => updatePricingField(field.id, 'label', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="label text-[10px]">Valor / Detalhe</label>
                <input
                  className="input"
                  value={field.value}
                  placeholder="Ex.: R$ 2.500,00, 12 meses..."
                  onChange={(e) => updatePricingField(field.id, 'value', e.target.value)}
                />
              </div>
              <div className="flex items-end justify-end sm:pt-4">
                <button
                  type="button"
                  className="btn-danger p-2"
                  onClick={() => removePricingField(field.id)}
                  title="Excluir este campo"
                  aria-label="Excluir campo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {pricingFields.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 dark:border-slate-700">
              Nenhuma condição financeira definida. Clique em "Adicionar Campo / Condição" para incluir.
            </div>
          )}
        </div>
      </section>

      <section className="card grid gap-4 p-6 sm:grid-cols-3">
        <h3 className="font-semibold sm:col-span-3">Níveis de SLA</h3>
        <div><label className="label">Resposta crítico</label><input {...txt('slaCritical')} /></div>
        <div><label className="label">Resposta normal</label><input {...txt('slaNormal')} /></div>
        <div>
          <label className="label">Modalidade</label>
          <select className="input" value={f.slaMode} onChange={(e) => set('slaMode', e.target.value as ProposalInput['slaMode'])}>
            <option>Remoto</option><option>Presencial</option><option>Remoto + Presencial</option>
          </select>
        </div>
      </section>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}

      <button className="btn-primary px-6 py-3" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? 'Gerando com IA…' : 'Gerar Proposta com IA'}
      </button>
    </form>
  );
}
