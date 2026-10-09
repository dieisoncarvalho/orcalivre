import type { CompanyProfile, ProposalContent, ProposalInput, Settings } from '../types';
import { friendlyError, generateProposalContent, testGeminiKey } from './gemini';
import { generateProposalContentOpenAI, testOpenAIKey } from './openai';

export const PROVIDER_LABEL = { gemini: 'Google Gemini', openai: 'OpenAI (ChatGPT)' } as const;

/** Chave e modelo ativos conforme o fornecedor selecionado. */
export const activeCreds = (s: Settings) =>
  s.provider === 'openai'
    ? { key: s.openaiKey, model: s.openaiModel }
    : { key: s.geminiKey, model: s.geminiModel };

/** Função unificada: mesmo formato ProposalContent independente do fornecedor. */
export async function generateProposal(
  settings: Settings,
  input: ProposalInput,
  company: CompanyProfile,
): Promise<ProposalContent> {
  const { key, model } = activeCreds(settings);
  return settings.provider === 'openai'
    ? generateProposalContentOpenAI(key, model, input, company)
    : generateProposalContent(key, model, input, company);
}

export const testConnection = (provider: Settings['provider'], key: string, model: string) =>
  provider === 'openai' ? testOpenAIKey(key, model) : testGeminiKey(key, model);

export const aiErrorMessage = (provider: Settings['provider'], e: unknown) =>
  provider === 'openai' ? (e instanceof Error ? e.message.slice(0, 300) : String(e)) : friendlyError(e);
