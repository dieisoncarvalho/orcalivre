import React, { useState } from 'react';
import { CheckCircle2, Loader2, Plus, RotateCcw, Save, ShieldCheck, Trash2, Upload, XCircle, Eye, EyeOff } from 'lucide-react';
import type { CompanyProfile, NumberingSettings, Settings } from '../types';
import { PROVIDER_LABEL, testConnection } from '../lib/ai';
import { fileToLogoDataUrl } from '../lib/utils';
import { PALETTE, contrastText, isValidHex, normalizeHex } from '../lib/color';
import { DEFAULT_PROJECT_TYPES } from '../lib/storage';

interface Props {
  company: CompanyProfile;
  settings: Settings;
  onCompany: (c: CompanyProfile) => void;
  onSettings: (s: Settings) => void;
  numbering: NumberingSettings;
  nextSuggestion: string;
  onNumbering: (n: NumberingSettings) => void;
  projectTypes: string[];
  onProjectTypes: (types: string[]) => void;
}

export default function SettingsPanel({
  company,
  settings,
  onCompany,
  onSettings,
  numbering,
  nextSuggestion,
  onNumbering,
  projectTypes,
  onProjectTypes,
}: Props) {
  const [typesList, setTypesList] = useState<string[]>(projectTypes);
  const [newTypeName, setNewTypeName] = useState('');
  const [typesSaved, setTypesSaved] = useState(false);

  const addProjectType = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTypeName.trim();
    if (!trimmed) return;
    if (typesList.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      alert('Este tipo de projeto já está na lista.');
      return;
    }
    const updated = [...typesList, trimmed];
    setTypesList(updated);
    setNewTypeName('');
    onProjectTypes(updated);
  };

  const updateProjectType = (index: number, val: string) => {
    const updated = [...typesList];
    updated[index] = val;
    setTypesList(updated);
  };

  const removeProjectType = (index: number) => {
    const updated = typesList.filter((_, i) => i !== index);
    setTypesList(updated);
    onProjectTypes(updated);
  };

  const saveProjectTypes = () => {
    const cleaned = typesList.map((t) => t.trim()).filter(Boolean);
    setTypesList(cleaned);
    onProjectTypes(cleaned);
    setTypesSaved(true);
    setTimeout(() => setTypesSaved(false), 2500);
  };

  const resetProjectTypes = () => {
    if (confirm('Restaurar a lista de tipos de projeto para os padrões recomendados?')) {
      setTypesList(DEFAULT_PROJECT_TYPES);
      onProjectTypes(DEFAULT_PROJECT_TYPES);
    }
  };
  const [nm, setNm] = useState({
    mode: numbering.mode,
    prefix: numbering.prefix,
    startText: String(numbering.next).padStart(numbering.digits, '0'),
  });
  const [nmSaved, setNmSaved] = useState(false);
  const saveNm = () => {
    const next = parseInt(nm.startText || '1', 10);
    onNumbering({
      mode: nm.mode,
      prefix: nm.prefix,
      next: Number.isFinite(next) ? next : 1,
      digits: Math.max(1, nm.startText.length || numbering.digits),
    });
    setNmSaved(true);
    setTimeout(() => setNmSaved(false), 2500);
  };
  const [colorText, setColorText] = useState(normalizeHex(company.primaryColor));
  const pickColor = (hex: string) => {
    setCo((c) => ({ ...c, primaryColor: normalizeHex(hex) }));
    setColorText(normalizeHex(hex));
  };
  const [provider, setProvider] = useState<Settings['provider']>(settings.provider);
  const [drafts, setDrafts] = useState({
    gemini: { key: settings.geminiKey, model: settings.geminiModel },
    openai: { key: settings.openaiKey, model: settings.openaiModel },
  });
  const isOpenAI = provider === 'openai';
  const key = drafts[provider].key;
  const model = drafts[provider].model;
  const setKey = (v: string) => setDrafts((d) => ({ ...d, [provider]: { ...d[provider], key: v } }));
  const setModel = (v: string) => setDrafts((d) => ({ ...d, [provider]: { ...d[provider], model: v } }));
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  const [keyMsg, setKeyMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [co, setCo] = useState<CompanyProfile>(company);
  const [saved, setSaved] = useState(false);

  const defaultModel = (p: Settings['provider']) => (p === 'openai' ? 'gpt-4o-mini' : 'gemini-2.5-flash');

  const buildSettings = (d = drafts): Settings => ({
    provider,
    geminiKey: d.gemini.key.trim(),
    geminiModel: d.gemini.model.trim() || defaultModel('gemini'),
    openaiKey: d.openai.key.trim(),
    openaiModel: d.openai.model.trim() || defaultModel('openai'),
  });

  const saveKey = () => {
    onSettings(buildSettings());
    setKeyMsg({ ok: true, text: `Fornecedor "${PROVIDER_LABEL[provider]}" salvo no localStorage deste navegador.` });
  };

  const removeKey = () => {
    const d = { ...drafts, [provider]: { ...drafts[provider], key: '' } };
    setDrafts(d);
    onSettings(buildSettings(d));
    setKeyMsg(null);
  };

  const test = async () => {
    setTesting(true);
    setKeyMsg(null);
    const r = await testConnection(provider, key.trim(), model.trim() || defaultModel(provider));
    setKeyMsg({ ok: r.ok, text: r.message });
    if (r.ok) onSettings(buildSettings());
    setTesting(false);
  };

  const onLogo = async (f?: File) => {
    if (!f) return;
    try {
      setCo({ ...co, logo: await fileToLogoDataUrl(f) });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao carregar logo');
    }
  };

  const set = (k: keyof CompanyProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setCo({ ...co, [k]: e.target.value });

  const Msg = ({ m }: { m: { ok: boolean; text: string } | null }) =>
    m ? (
      <p className={`mt-2 flex items-center gap-1 text-sm ${m.ok ? 'text-green-600' : 'text-red-600'}`}>
        {m.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} {m.text}
      </p>
    ) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Configurações</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Open Source • 100% Client-Side
        </span>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs leading-relaxed">
          <b>Privacidade Garantida:</b> Todas as chaves de API (BYOK), perfis e propostas ficam salvos exclusivamente no <code>localStorage</code> deste navegador. Nenhuma requisição passa por servidores proprietários.
        </p>
      </div>

      <section className="card space-y-3 p-6">
        <h3 className="font-semibold">Fornecedor de IA & API Key (BYOK)</h3>
        <div>
          <label className="label">Fornecedor</label>
          <select className="input" value={provider} onChange={(e) => { setProvider(e.target.value as Settings['provider']); setKeyMsg(null); }}>
            <option value="gemini">{PROVIDER_LABEL.gemini}</option>
            <option value="openai">{PROVIDER_LABEL.openai}</option>
          </select>
        </div>
        <p className="text-xs text-slate-500">
          Sua chave fica apenas no localStorage deste navegador e é usada diretamente nas chamadas à API do fornecedor.{' '}
          {isOpenAI ? 'Gere em platform.openai.com/api-keys.' : 'Gere em aistudio.google.com/apikey.'}
        </p>
        <div className="relative">
          <label className="label">{isOpenAI ? 'OpenAI API Key' : 'Gemini API Key'}</label>
          <input className="input pr-10 font-mono" type={show ? 'text' : 'password'} placeholder={isOpenAI ? 'sk-…' : 'AIza…'} value={key} onChange={(e) => setKey(e.target.value)} autoComplete="off" />
          <button type="button" className="absolute right-2 top-8 text-slate-400" onClick={() => setShow(!show)} aria-label="Mostrar/ocultar">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div>
          <label className="label">Modelo</label>
          <input className="input" list="model-suggestions" value={model} onChange={(e) => setModel(e.target.value)} />
          <datalist id="model-suggestions">
            {(isOpenAI ? ['gpt-4o-mini', 'gpt-4o'] : ['gemini-2.5-flash', 'gemini-2.5-pro']).map((m) => <option key={m} value={m} />)}
          </datalist>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={test} disabled={!key.trim() || testing}>
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Testar conexão
          </button>
          <button className="btn-primary" onClick={saveKey}><Save className="h-4 w-4" /> Salvar</button>
          {key && (
            <button className="btn-danger" onClick={removeKey}>
              <Trash2 className="h-4 w-4" /> Remover chave
            </button>
          )}
        </div>
        <Msg m={keyMsg} />
      </section>


      <section className="card space-y-4 p-6">
        <h3 className="font-semibold">Numeração da Proposta</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" name="nmode" checked={nm.mode === 'auto'} onChange={() => setNm({ ...nm, mode: 'auto' })} />
            Automática (prefixo + contador)
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" name="nmode" checked={nm.mode === 'manual'} onChange={() => setNm({ ...nm, mode: 'manual' })} />
            Manual (digitar a cada proposta)
          </label>
        </div>
        {nm.mode === 'auto' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Prefixo / máscara</label>
              <input className="input font-mono" value={nm.prefix} placeholder="PP-2026-" onChange={(e) => setNm({ ...nm, prefix: e.target.value })} />
            </div>
            <div>
              <label className="label">Próximo número (zeros definem o tamanho)</label>
              <input className="input font-mono" value={nm.startText} placeholder="0001" inputMode="numeric" onChange={(e) => setNm({ ...nm, startText: e.target.value.replace(/\D/g, '') })} />
            </div>
            <p className="text-xs text-slate-500 sm:col-span-2">
              Próxima proposta: <b className="font-mono">{nm.prefix}{nm.startText || '—'}</b> • incrementa automaticamente a cada proposta criada e pode ser ajustado no formulário.
              {nm.prefix === numbering.prefix && nextSuggestion !== numbering.prefix + String(numbering.next).padStart(numbering.digits, '0') && ' (números já existentes são pulados automaticamente.)'}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500">O número será digitado livremente no formulário de cada proposta.</p>
        )}
        <button className="btn-primary" onClick={saveNm} disabled={nm.mode === 'auto' && !nm.startText}>
          <Save className="h-4 w-4" /> {nmSaved ? 'Salvo!' : 'Salvar numeração'}
        </button>
      </section>

      <section className="card space-y-4 p-6">
        <h3 className="font-semibold">Perfil da Empresa Prestadora</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label">Nome / Razão Social</label><input className="input" value={co.name} onChange={set('name')} /></div>
          <div><label className="label">CNPJ</label><input className="input" value={co.cnpj} onChange={set('cnpj')} placeholder="00.000.000/0000-00" /></div>
          <div><label className="label">Telefone</label><input className="input" value={co.phone} onChange={set('phone')} /></div>
          <div><label className="label">E-mail</label><input className="input" type="email" value={co.email} onChange={set('email')} /></div>
          <div><label className="label">Endereço (opcional)</label><input className="input" value={co.address} onChange={set('address')} /></div>
          <div className="sm:col-span-2">
            <label className="label">Termos padrão</label>
            <textarea className="input" rows={4} value={co.defaultTerms} onChange={set('defaultTerms')} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Logo</label>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white dark:border-slate-700">
                {co.logo ? <img src={co.logo} alt="Logo" className="max-h-16 max-w-36 object-contain" /> : <span className="text-xs text-slate-400">Sem logo</span>}
              </div>
              <label className="btn-ghost cursor-pointer">
                <Upload className="h-4 w-4" /> Enviar imagem
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
              </label>
              {co.logo && <button className="btn-danger" onClick={() => setCo({ ...co, logo: undefined })}><Trash2 className="h-4 w-4" /></button>}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Cor primária / destaque da proposta</label>
            <div className="flex flex-wrap items-center gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c.hex} type="button" title={`${c.name} ${c.hex}`} aria-label={c.name}
                  onClick={() => pickColor(c.hex)}
                  className={`h-8 w-8 rounded-full border-2 transition ${co.primaryColor.toUpperCase() === c.hex ? 'border-slate-900 ring-2 ring-offset-2 ring-slate-400 dark:border-white' : 'border-white dark:border-slate-700'}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              <input
                type="color" aria-label="Seletor de cor livre" value={normalizeHex(co.primaryColor)}
                onChange={(e) => pickColor(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-slate-300 bg-transparent p-0.5 dark:border-slate-700"
              />
              <input
                className="input w-28 font-mono uppercase" maxLength={7} value={colorText} placeholder="#1E40AF"
                onChange={(e) => {
                  setColorText(e.target.value);
                  if (isValidHex(e.target.value)) setCo({ ...co, primaryColor: normalizeHex(e.target.value) });
                }}
              />
            </div>
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 text-xs dark:border-slate-700" style={{ borderTop: `4px solid ${normalizeHex(co.primaryColor)}` }}>
              <div className="px-3 py-2 font-semibold" style={{ backgroundColor: normalizeHex(co.primaryColor), color: contrastText(normalizeHex(co.primaryColor)) }}>Item · Detalhe (cabeçalho de tabela)</div>
              <div className="px-3 py-2"><b style={{ color: normalizeHex(co.primaryColor) }}>1.</b> Prévia da cor aplicada no PDF</div>
            </div>
          </div>
        </div>
        <button className="btn-primary" onClick={() => { onCompany(co); setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
          <Save className="h-4 w-4" /> {saved ? 'Salvo!' : 'Salvar perfil'}
        </button>
      </section>

      <section className="card space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">Tipos de Projeto Cadastrados</h3>
            <p className="text-xs text-slate-500">
              Personalize as opções que aparecem na criação de novas propostas. Edite o texto, exclua ou adicione novos.
            </p>
          </div>
          <button type="button" className="btn-ghost text-xs" onClick={resetProjectTypes} title="Restaurar lista original">
            <RotateCcw className="h-3.5 w-3.5" /> Restaurar padrões
          </button>
        </div>

        <div className="space-y-2">
          {typesList.map((type, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                className="input flex-1"
                value={type}
                placeholder="Nome do tipo de projeto..."
                onChange={(e) => updateProjectType(idx, e.target.value)}
              />
              <button
                type="button"
                className="btn-danger p-2"
                onClick={() => removeProjectType(idx)}
                title="Excluir este tipo de projeto"
                aria-label="Excluir tipo de projeto"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {typesList.length === 0 && (
            <p className="py-2 text-center text-xs text-slate-400">Nenhum tipo cadastrado. Adicione um abaixo ou restaure os padrões.</p>
          )}
        </div>

        <form onSubmit={addProjectType} className="flex gap-2 pt-2">
          <input
            className="input flex-1"
            placeholder="Novo tipo de projeto (ex.: Cabeamento Estruturado, CFTV...)"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
          />
          <button type="submit" className="btn-ghost shrink-0" disabled={!newTypeName.trim()}>
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </form>

        <div className="pt-2">
          <button type="button" className="btn-primary" onClick={saveProjectTypes}>
            <Save className="h-4 w-4" /> {typesSaved ? 'Salvo!' : 'Salvar tipos de projeto'}
          </button>
        </div>
      </section>
    </div>
  );
}
