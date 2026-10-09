import { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { verifyLicense } from '../lib/license';

export default function ActivationGate({ onActivated }: { onActivated: (token: string) => void }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = verifyLicense(token);
    if (!r.valid) return setError(r.reason);
    onActivated(token.replace(/\s+/g, ''));
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-md space-y-5 p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-600 p-3 text-white"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <h1 className="text-xl font-bold">PropostaPro</h1>
            <p className="text-sm text-slate-500">Ative sua licença para começar</p>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="lic">Chave de Ativação</label>
          <textarea
            id="lic" rows={4} className="input font-mono text-xs" placeholder="PP1.xxxxx.xxxxx"
            value={token} onChange={(e) => { setToken(e.target.value); setError(''); }}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        <button className="btn-primary w-full" disabled={!token.trim()}><KeyRound className="h-4 w-4" /> Ativar</button>
        <p className="text-xs text-slate-500">
          A validação é feita 100% no seu navegador por assinatura digital. Nenhum dado é enviado a servidores.
        </p>
      </form>
    </div>
  );
}
