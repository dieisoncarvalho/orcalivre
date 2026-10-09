import { GoogleGenAI, Type } from '@google/genai';
import type { CompanyProfile, ProposalContent, ProposalInput } from '../types';

export const SYSTEM_INSTRUCTION = `Você é um consultor sênior de TI e Serviços Gerenciados, especialista em redigir propostas comerciais e escopos técnicos claros, objetivos e juridicamente prudentes, em português do Brasil.

Regras:
- Use as ANOTAÇÕES BRUTAS como fonte principal; organize, complemente com boas práticas do tipo de projeto, mas NUNCA invente valores, prazos, marcas ou quantidades que não foram informados.
- Tom corporativo, direto e profissional. Sem emojis, sem markdown (nada de **, #, etc.).
- "escopo": lista de entregas concretas e verificáveis (cada item uma frase completa).
- "limites": lista do que NÃO está incluso (itens fora do escopo, hardware/licenças de terceiros, deslocamentos extras, serviços fora do horário, etc.), protegendo o prestador de escopo aberto.
- "sla": texto de Termos de SLA & Prazos usando os níveis informados (crítico, normal, modalidade de atendimento), horário de atendimento, canais e prazos de execução. Parágrafos separados por linha em branco.
- "condicoes": texto de Condições Comerciais & Investimento descrevendo valores informados, forma de pagamento, faturamento, vigência, reajuste/rescisão em linhas gerais. Parágrafos separados por linha em branco.
- "objetivo": 1 a 2 parágrafos descrevendo o objetivo e o benefício para o cliente.
Responda EXCLUSIVAMENTE com JSON válido conforme o schema.`;

export function buildPrompt(input: ProposalInput, company: CompanyProfile): string {
  const pricingLines = (input.pricingFields && input.pricingFields.length > 0)
    ? input.pricingFields
        .filter((f) => f.label.trim() && f.value.trim())
        .map((f) => `- ${f.label.trim()}: ${f.value.trim()}`)
        .join('\n')
    : [
        input.priceUpfront && `- Valor à vista / implantação: ${input.priceUpfront}`,
        input.priceMonthly && `- Mensalidade: ${input.priceMonthly}`,
        input.validity && `- Prazo de vigência: ${input.validity}`,
        input.billing && `- Forma de faturamento: ${input.billing}`,
        input.paymentTerms && `- Condições adicionais: ${input.paymentTerms}`,
      ].filter(Boolean).join('\n');

  return `PRESTADOR: ${company.name || '(não informado)'}
CLIENTE: ${input.clientName} | Contato: ${input.clientContact} | E-mail: ${input.clientEmail}
TIPO DE PROJETO: ${input.projectType}

ANOTAÇÕES BRUTAS / ESCOPO LIVRE:
${input.notes || '(sem anotações; use boas práticas do tipo de projeto)'}

VALORES, CONDIÇÕES E PRAZOS COMERCIAIS:
${pricingLines || '- Nenhuma condição financeira especificada'}

SLA:
- Tempo de resposta crítico: ${input.slaCritical}
- Tempo de resposta normal: ${input.slaNormal}
- Modalidade: ${input.slaMode}

TERMOS PADRÃO DO PRESTADOR (considere/respeite): ${company.defaultTerms || 'nenhum'}`;
}

export async function generateProposalContent(
  apiKey: string,
  model: string,
  input: ProposalInput,
  company: CompanyProfile,
): Promise<ProposalContent> {
  const ai = new GoogleGenAI({ apiKey });
  const str = { type: Type.STRING };
  const arr = { type: Type.ARRAY, items: { type: Type.STRING } };
  const res = await ai.models.generateContent({
    model,
    contents: buildPrompt(input, company),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      temperature: 0.4,
      responseSchema: {
        type: Type.OBJECT,
        properties: { objetivo: str, escopo: arr, limites: arr, sla: str, condicoes: str },
        required: ['objetivo', 'escopo', 'limites', 'sla', 'condicoes'],
      },
    },
  });
  return parseContent(res.text ?? '');
}

/** Normaliza a saída JSON de qualquer provedor para o formato ProposalContent. */
export function parseContent(raw: string): ProposalContent {
  const text = raw.trim().replace(/^```json\s*|```$/g, '');
  const data = JSON.parse(text) as Partial<ProposalContent>;
  const list = (v: unknown) => (Array.isArray(v) ? v.map(String) : typeof v === 'string' ? v.split('\n') : []);
  return {
    objetivo: data.objetivo ?? '',
    escopo: list(data.escopo),
    limites: list(data.limites),
    sla: data.sla ?? '',
    condicoes: data.condicoes ?? '',
  };
}

export async function testGeminiKey(apiKey: string, model: string): Promise<{ ok: boolean; message: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model,
      contents: 'Responda apenas: OK',
      config: { maxOutputTokens: 256, thinkingConfig: { thinkingBudget: 0 } },
    });
    return { ok: true, message: `Conexão estabelecida com ${model}. ${res.text ? '' : ''}`.trim() };
  } catch (e) {
    return { ok: false, message: friendlyError(e) };
  }
}

export function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/API key not valid|API_KEY_INVALID|\b400\b/i.test(msg)) return 'API Key inválida ou modelo não disponível para esta chave.';
  if (/\b403\b|permission/i.test(msg)) return 'Acesso negado pela API (verifique permissões da chave).';
  if (/\b429\b|quota/i.test(msg)) return 'Cota/limite de requisições excedido. Tente novamente em instantes.';
  if (/Failed to fetch|NetworkError/i.test(msg)) return 'Falha de rede ao contatar a API do Gemini.';
  return msg.slice(0, 300);
}
