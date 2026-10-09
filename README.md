<div align="center">

# 📄 OrçaLivre

> **Gerador & Formatador Inteligente de Propostas Comerciais de TI e Serviços (100% Client-Side, Open Source e BYOK)**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Architecture](https://img.shields.io/badge/Architecture-100%25_Client--Side-brightgreen)](#-pilares-do-projeto)

*Crie propostas comerciais e escopos técnicos de alto padrão executivo em segundos, com IA calibrada e renderização de PDF vetorial direto no navegador.*

[Pilares](#-pilares-do-projeto) • [Demonstração](#-capturas-de-tela) • [Recursos](#-principais-recursos) • [Como Rodar](#-como-rodar-localmente) • [Deploy com Docker](#-deploy-na-vps-com-docker) • [Obter Chaves de API](#-como-obter-chaves-de-api-byok)

---

</div>

## 🌟 Pilares do Projeto

O **OrçaLivre** foi construído com princípios claros de transparência, soberania de dados e eficiência:

1. 🔒 **100% Offline-First / Client-Side**: Seus dados, contatos de clientes, valores de propostas e chaves de API **nunca saem do seu dispositivo**. Nenhuma requisição passa por servidores intermediários — a persistência ocorre exclusivamente no `localStorage` do seu navegador.
2. 🔑 **Modelo BYOK (Bring Your Own Key)**: Integração nativa com **OpenAI (ChatGPT)** e **Google Gemini**. Você utiliza sua própria chave de API diretamente do client, sem mensalidades adicionais e pagando apenas pelo que consome junto aos provedores.
3. 📑 **PDF Vetorial Executivo Pronto para Assinatura**: Geração direta no navegador via `@react-pdf/renderer`. Inclui tabela financeira dinâmica, termos de SLA, validade, paginação numerada e bloco de assinaturas para ambas as partes.
4. 🚀 **Deploy Leve com Consumo Quase Nulo**: Hospedagem estática (Nginx Alpine) com multi-stage build via Docker. Consumo de memória inferior a **20MB** de RAM na VPS.
5. ⚖️ **100% Open Source (Licença MIT)**: Totalmente gratuito e livre para uso pessoal, comercial ou modificação pela comunidade.

---

## 🖼️ Capturas de Tela

<div align="center">

> *Substitua os links abaixo pelas capturas de tela reais da aplicação.*

| Criador de Propostas com IA | Editor Inline & Preview de PDF em Tempo Real |
| :---: | :---: |
| ![Formulário de Criação](https://placehold.co/600x380/1e293b/white?text=Or%C3%A7aLivre+-+Formul%C3%A1rio) | ![Preview e Download de PDF](https://placehold.co/600x380/1e40af/white?text=Or%C3%A7aLivre+-+PDF+Executivo) |

</div>

---

## 🚀 Principais Recursos

- 🤖 **Geração Inteligente via IA**:
  - Cole anotações brutas, mensagens de WhatsApp ou requisitos de reuniões.
  - A IA calibra e estrutura o documento em 5 seções executivas:
    1. *Objetivo do Projeto*
    2. *Escopo Detalhado das Entregas*
    3. *Limites de Escopo (O que NÃO está incluso)*
    4. *Termos de SLA & Prazos*
    5. *Condições Comerciais & Investimento*
- 🎨 **Personalização de Cores do PDF**:
  - Selecione paletas profissionais (*Azul Executivo, Cinzento Grafite, Verde Escuro, Roxo, Bordô*) ou escolha qualquer cor Hexadecimal personalizada.
  - A cor escolhida reflete dinamicamente em divisórias, cabeçalhos de tabela, números de seção e caixas de destaque do PDF.
- 🔢 **Numeração de Proposta Flexível**:
  - **Modo Automático**: Prefixo customizável (ex.: `PROP-2026-`, `ORC-`) com incremento sequencial automático e zeros à esquerda.
  - **Modo Manual**: Digitação livre do número da proposta caso prefira controle pontual.
- 🗂️ **Tipos de Projeto Customizáveis**:
  - Cadastre, edite ou remova tipos de projetos no painel de configurações (ex.: *Venda de Equipamentos, Suporte Mensal, CFTV, Redes*). Permite também digitar opções avulsas diretamente na criação.
- 💰 **Valores, Condições e Prazos 100% Dinâmicos**:
  - Sistema de itens flexíveis (Chave/Valor).
  - Renomeie rótulos conforme a necessidade (*Mensalidade, Garantia de Peças, Sinal de Entrada*), exclua o que não se aplicar e adicione novas linhas livremente.
- ✏️ **Editor Inline & Live Preview**:
  - Edite qualquer texto gerado diretamente no editor integrado, com atualização imediata no visualizador de PDF.
- 🗃️ **Histórico Local Completo**:
  - Rascunhos e propostas salvas no navegador para busca, edição, duplicação e reemissão de PDF a qualquer momento.
- 🌓 **Tema Claro e Escuro (Dark Mode)**:
  - Alternância fluida com persistência no navegador.

---

## 💻 Como Rodar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão **18+** instalada.
- Gerenciador de pacotes `npm`, `pnpm` ou `yarn`.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/orcalivre.git
   cd orcalivre
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Abra no navegador em: `http://localhost:5173`

4. **Gerar build de produção:**
   ```bash
   npm run build
   npm run preview
   ```
   Os arquivos finais compilados estarão na pasta `dist/`.

---

## 🐳 Deploy na VPS com Docker

Como o OrçaLivre é totalmente client-side, o container serve apenas arquivos estáticos através do Nginx Alpine com compressão e segurança otimizadas:

1. **Subir com Docker Compose:**
   ```bash
   docker compose up -d --build
   ```

2. **Acessar:**
   - A aplicação estará disponível na porta `8080`: `http://SEU_IP_OU_DOMINIO:8080`

3. **Recursos do servidor (`nginx.conf`):**
   - Fallback para Single Page Application (`try_files $uri /index.html;`).
   - Compressão Gzip para carregamento instantâneo.
   - Cabeçalhos de segurança (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options).

---

## 🔑 Como Obter Chaves de API (BYOK)

O OrçaLivre conecta diretamente ao provedor da sua escolha:

### Opção 1: Google Gemini (Recomendado / Cota Gratuita Generosa)
1. Acesse o [Google AI Studio](https://aistudio.google.com/apikey).
2. Clique em **"Create API key"**.
3. No OrçaLivre, acesse **Configurações**, selecione **Google Gemini**, cole sua chave (`AIza...`) e clique em **Testar conexão**.

### Opção 2: OpenAI (ChatGPT)
1. Acesse o [OpenAI API Keys Dashboard](https://platform.openai.com/api-keys).
2. Crie uma nova chave secreta (`sk-...`).
3. No OrçaLivre, acesse **Configurações**, selecione **OpenAI (ChatGPT)**, cole a chave e escolha o modelo desejado (`gpt-4o-mini` ou `gpt-4o`).

---

## 📂 Estrutura do Projeto

```text
orcalivre/
├── public/                 # Assets públicos, favicon e inicializador de tema
├── src/
│   ├── components/         # Componentes React
│   │   ├── History.tsx         # Histórico de propostas salvas
│   │   ├── PdfPreview.tsx      # Visualizador de PDF embutido
│   │   ├── ProposalEditor.tsx  # Editor inline e live preview
│   │   ├── ProposalForm.tsx    # Formulário com campos comerciais dinâmicos
│   │   ├── ProposalPDF.tsx     # Renderizador vetorial (@react-pdf/renderer)
│   │   └── SettingsPanel.tsx   # Painel de BYOK, cores, numeração e perfil
│   ├── lib/                # Lógica de negócio client-side
│   │   ├── ai.ts               # Orquestrador unificado de IA
│   │   ├── color.ts            # Gerenciamento de cores, temas e contraste
│   │   ├── gemini.ts           # Integração com Google GenAI SDK
│   │   ├── openai.ts           # Integração REST oficial com OpenAI
│   │   ├── pdf.ts              # Utilitários de compilação e download de PDF
│   │   ├── storage.ts          # Persistência e migração no LocalStorage
│   │   └── utils.ts            # Formatadores, IDs e tratamento de logo
│   ├── types.ts            # Interfaces TypeScript
│   ├── App.tsx             # Aplicação principal e navegação
│   ├── main.tsx            # Ponto de entrada React
│   └── index.css           # Estilos globais Tailwind CSS
├── nginx.conf              # Configuração Nginx para produção
├── security-headers.conf   # Cabeçalhos HTTP e CSP
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Configuração Docker Compose
├── LICENSE                 # Licença MIT
└── package.json            # Metadados e dependências
```

---

## 🤝 Contribuindo

Contribuições da comunidade são muito bem-vindas!

1. Faça um **Fork** do projeto.
2. Crie sua branch de funcionalidade: `git checkout -b feature/minha-melhoria`.
3. Faça commit das mudanças: `git commit -m 'feat: minha nova funcionalidade'`.
4. Envie para a branch: `git push origin feature/minha-melhoria`.
5. Abra um **Pull Request**.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor & Apoio ao Projeto

**Dieison Carvalho** — Especialista em infraestrutura de TI, redes e automações, apaixonado por ferramentas de produtividade e soluções open source.

- 🐙 **GitHub:** [github.com/seu-usuario](https://github.com/dieisoncarvalho)
- ✉️ **E-mail:** [dieisondavid@gmail.com](mailto:dieisondavid@gmail.com)

### ☕ Gostou do projeto e quer apoiar?

O OrçaLivre é gratuito e sempre será. Se ele te ajudou a fechar contratos ou economizar tempo, considere apoiar o desenvolvimento:

- 💸 **Chave PIX:** `83f04bf1-9852-4e58-aaa8-5e51af5e911d`
- ☕ **Apoie com um café:**

  [![Apoie com um café](https://img.shields.io/badge/☕_Apoie_com_um_café-FFDD00?style=for-the-badge&logoColor=black)](https://buymeacoffee.com/dieisoncarvalho)

- ⭐ Também ajuda muito: dar uma estrela no repositório e compartilhar com colegas!

---

<div align="center">
<b>OrçaLivre</b> • Potencializando negócios de tecnologia com privacidade e IA.
</div>
