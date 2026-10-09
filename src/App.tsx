import { useCallback, useState } from 'react';
import { FilePlus2, FileText, Heart, History as HistoryIcon, Moon, Settings as SettingsIcon, Sun } from 'lucide-react';
import type { CompanyProfile, NumberingSettings, Proposal, ProposalContent, ProposalInput, Settings } from './types';
import { storage } from './lib/storage';
import { defaultNumbering, suggestNumber, uid } from './lib/utils';
import SettingsPanel from './components/SettingsPanel';
import ProposalForm from './components/ProposalForm';
import ProposalEditor from './components/ProposalEditor';
import History from './components/History';
import SupportModal from './components/SupportModal';
import { SUPPORT } from './config/support';

type View = 'new' | 'editor' | 'history' | 'settings';

export default function App() {
  const [view, setView] = useState<View>('new');
  const [supportOpen, setSupportOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [company, setCompany] = useState<CompanyProfile>(() => storage.getCompany());
  const [settings, setSettings] = useState<Settings>(() => storage.getSettings());
  const [proposals, setProposals] = useState<Proposal[]>(() => storage.getProposals());
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [editingInput, setEditingInput] = useState<Proposal | null>(null);
  const [numbering, setNumbering] = useState<NumberingSettings>(() => storage.getNumbering() ?? defaultNumbering(storage.getProposals()));
  const saveNumbering = (n: NumberingSettings) => { setNumbering(n); storage.setNumbering(n); };
  const [projectTypes, setProjectTypes] = useState<string[]>(() => storage.getProjectTypes());
  const saveProjectTypes = (types: string[]) => { setProjectTypes(types); storage.setProjectTypes(types); };

  const persist = useCallback((list: Proposal[]) => {
    setProposals(list);
    storage.setProposals(list);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    storage.setTheme(next ? 'dark' : 'light');
    setDark(next);
  };

  const current = proposals.find((p) => p.id === currentId) ?? null;
  const open = (id: string) => { setCurrentId(id); setView('editor'); };

  const suggestion = suggestNumber(numbering, proposals);

  const onGenerated = (input: ProposalInput, content: ProposalContent, number: string) => {
    const now = new Date().toISOString();
    if (editingInput) {
      const updated = { ...editingInput, number, input, content, updatedAt: now };
      persist(proposals.map((p) => (p.id === updated.id ? updated : p)));
      setEditingInput(null);
      open(updated.id);
    } else {
      const p: Proposal = { id: uid(), number, createdAt: now, updatedAt: now, status: 'draft', input, content };
      persist([p, ...proposals]);
      // Incrementa o contador somente se o número sugerido foi efetivamente usado.
      if (numbering.mode === 'auto' && number === suggestion.text) saveNumbering({ ...numbering, next: suggestion.index + 1 });
      open(p.id);
    }
  };

  const update = (p: Proposal) => persist(proposals.map((x) => (x.id === p.id ? { ...p, updatedAt: new Date().toISOString() } : x)));

  const duplicate = (id: string) => {
    const src = proposals.find((p) => p.id === id);
    if (!src) return;
    const now = new Date().toISOString();
    const auto = numbering.mode === 'auto';
    const copy: Proposal = {
      ...JSON.parse(JSON.stringify(src)), id: uid(),
      number: auto ? suggestion.text : `${src.number}-COPIA`,
      createdAt: now, updatedAt: now, status: 'draft',
    };
    persist([copy, ...proposals]);
    if (auto) saveNumbering({ ...numbering, next: suggestion.index + 1 });
    open(copy.id);
  };

  const nav = (v: View, label: string, Icon: typeof FileText) => (
    <button
      onClick={() => { if (v === 'new') setEditingInput(null); setView(v); }}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${view === v ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
    >
      <Icon className="h-4 w-4" /> <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2 font-bold text-brand-700 dark:text-brand-300">
            <FileText className="h-6 w-6" /> OrçaLivre
          </div>
          <nav className="flex items-center gap-1">
            {nav('new', 'Nova proposta', FilePlus2)}
            {nav('history', 'Histórico', HistoryIcon)}
            {nav('settings', 'Configurações', SettingsIcon)}
            <button onClick={toggleTheme} className="ml-2 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Alternar tema">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {view === 'new' && (
          <ProposalForm
            key={editingInput?.id ?? 'new'}
            initial={editingInput?.input}
            initialNumber={editingInput?.number}
            numbering={numbering}
            suggestedNumber={suggestion.text}
            takenNumbers={proposals.filter((p) => p.id !== editingInput?.id).map((p) => p.number.trim().toLowerCase())}
            projectTypes={projectTypes}
            company={company}
            settings={settings}
            onGenerated={onGenerated}
            onGoSettings={() => setView('settings')}
          />
        )}
        {view === 'editor' && current && (
          <ProposalEditor
            key={current.id}
            proposal={current}
            company={company}
            onChange={update}
            onIssue={(p) => update({ ...p, status: 'issued' })}
            onBack={() => { setEditingInput(current); setView('new'); }}
          />
        )}
        {view === 'history' && (
          <History
            proposals={proposals}
            company={company}
            onEdit={open}
            onDuplicate={duplicate}
            onDelete={(id) => persist(proposals.filter((p) => p.id !== id))}
            onNew={() => { setEditingInput(null); setView('new'); }}
          />
        )}
        {view === 'settings' && (
          <SettingsPanel
            company={company}
            settings={settings}
            onCompany={(c) => { setCompany(c); storage.setCompany(c); }}
            onSettings={(s) => { setSettings(s); storage.setSettings(s); }}
            numbering={numbering}
            nextSuggestion={suggestion.text}
            onNumbering={saveNumbering}
            projectTypes={projectTypes}
            onProjectTypes={saveProjectTypes}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 py-5 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 text-xs text-slate-500 dark:text-slate-400">
          <span>OrçaLivre — Criado por {SUPPORT.author} · Código aberto sob licença MIT</span>
          <button
            onClick={() => setSupportOpen(true)}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
          >
            <Heart className="h-3.5 w-3.5" /> Apoiar projeto
          </button>
        </div>
      </footer>

      {supportOpen && <SupportModal onClose={() => setSupportOpen(false)} />}
    </div>
  );
}
