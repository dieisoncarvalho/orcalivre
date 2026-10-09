import type { CompanyProfile, ProposalContent, ProposalInput } from '../types';
import { SYSTEM_INSTRUCTION, buildPrompt, parseContent } from './gemini';

const URL = 'https://api.openai.com/v1/chat/completions';

const SCHEMA_HINT = `

Formato JSON obrigatório (exatamente estas chaves):
{
  "objetivo": "string",
  "escopo": ["string", "..."],
  "limites": ["string", "..."],
  "sla": "string",
  "condicoes": "string"
}`;

async function chat(apiKey: string, body: Record<string, unknown>): Promise<string> {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = '';
    try {
      detail = (await res.json())?.error?.message ?? '';
    } catch { /* ignore */ }
    throw new Error(`OpenAI ${res.status}: ${detail || res.statusText}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

export async function generateProposalContentOpenAI(
  apiKey: string,
  model: string,
  input: ProposalInput,
  company: CompanyProfile,
): Promise<ProposalContent> {
  const text = await chat(apiKey, {
    model,
    temperature: 0.4,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION + SCHEMA_HINT },
      { role: 'user', content: buildPrompt(input, company) },
    ],
  });
  return parseContent(text);
}

export async function testOpenAIKey(apiKey: string, model: string): Promise<{ ok: boolean; message: string }> {
  try {
    await chat(apiKey, {
      model,
      max_tokens: 5,
      messages: [{ role: 'user', content: 'Responda apenas: OK' }],
    });
    return { ok: true, message: `Conexão estabelecida com OpenAI (${model}).` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/\b401\b/.test(msg)) return { ok: false, message: 'API Key da OpenAI inválida.' };
    if (/\b429\b/.test(msg)) return { ok: false, message: 'Limite/cota excedido na OpenAI (verifique créditos).' };
    if (/\b404\b/.test(msg)) return { ok: false, message: 'Modelo não encontrado ou sem acesso para esta chave.' };
    if (/Failed to fetch/i.test(msg)) return { ok: false, message: 'Falha de rede ao contatar a OpenAI.' };
    return { ok: false, message: msg.slice(0, 300) };
  }
}
