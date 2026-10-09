import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { CompanyProfile, Proposal } from '../types';
import { fmtDate } from '../lib/utils';
import { buildTheme, type PdfTheme } from '../lib/color';

const GRAY = '#475569';

function makeStyles(t: PdfTheme) {
  return StyleSheet.create({
    page: { paddingTop: 100, paddingBottom: 68, paddingHorizontal: 44, fontSize: 10, fontFamily: 'Helvetica', color: '#1e293b', lineHeight: 1.5 },
    header: { position: 'absolute', top: 24, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: t.accent, paddingBottom: 8 },
    logo: { maxHeight: 44, maxWidth: 130, objectFit: 'contain' },
    companyName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: t.accent },
    companyMeta: { fontSize: 8, color: GRAY },
    headRight: { alignItems: 'flex-end' },
    footer: { position: 'absolute', bottom: 24, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: t.line, paddingTop: 6, fontSize: 8, color: GRAY },
    titleBar: { borderLeftWidth: 5, borderLeftColor: t.accent, paddingLeft: 10, marginBottom: 16 },
    title: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: t.accent },
    subtitle: { fontSize: 11, color: GRAY },
    infoBox: { borderWidth: 1, borderColor: t.line, borderTopWidth: 3, borderTopColor: t.accent, borderRadius: 3, marginBottom: 16 },
    infoRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: t.line },
    infoLabel: { width: 110, padding: 6, backgroundColor: t.soft, fontFamily: 'Helvetica-Bold', fontSize: 9, color: t.accent },
    infoValue: { flex: 1, padding: 6 },
    h2Wrap: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: t.line },
    h2Num: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: t.accent, marginRight: 6 },
    h2: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
    p: { marginBottom: 6, textAlign: 'justify' },
    bulletRow: { flexDirection: 'row', marginBottom: 4 },
    bullet: { width: 12, color: t.accent, fontFamily: 'Helvetica-Bold' },
    bulletText: { flex: 1 },
    highlights: { flexDirection: 'row', marginTop: 4, marginBottom: 10 },
    hlBox: { flex: 1, borderWidth: 1, borderColor: t.line, borderLeftWidth: 4, borderLeftColor: t.accent, backgroundColor: t.soft, padding: 8, marginRight: 8 },
    hlLabel: { fontSize: 8, color: GRAY, textTransform: 'uppercase' },
    hlValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: t.accent, marginTop: 2 },
    table: { borderWidth: 1, borderColor: t.line, marginTop: 4, marginBottom: 14 },
    th: { flexDirection: 'row', backgroundColor: t.accent, color: t.onAccent, fontFamily: 'Helvetica-Bold' },
    tr: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: t.line },
    trAlt: { backgroundColor: t.soft },
    td1: { flex: 2, padding: 6 },
    td2: { flex: 3, padding: 6 },
    terms: { marginTop: 8 },
    acceptBlock: { marginTop: 36 },
    acceptTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: t.accent, marginBottom: 4, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: t.line },
    acceptText: { fontSize: 9, color: GRAY, textAlign: 'justify' },
    sigWrap: { marginTop: 46, flexDirection: 'row', justifyContent: 'space-between' },
    sigBox: { width: '45%', alignItems: 'center' },
    sigLine: { width: '100%', borderTopWidth: 1, borderTopColor: '#0f172a', marginBottom: 4 },
    sigName: { fontFamily: 'Helvetica-Bold', fontSize: 10, textAlign: 'center' },
    sigSub: { fontSize: 8, color: GRAY, textAlign: 'center' },
  });
}

type Styles = ReturnType<typeof makeStyles>;

const paragraphs = (t: string) => t.split(/\n+/).map((x) => x.trim()).filter(Boolean);

function Paragraphs({ s, text }: { s: Styles; text: string }) {
  return (
    <>
      {paragraphs(text).map((t, i) => (
        <Text key={i} style={s.p} orphans={2} widows={2}>{t}</Text>
      ))}
    </>
  );
}

function Bullets({ s, items }: { s: Styles; items: string[] }) {
  return (
    <>
      {items.filter((i) => i.trim()).map((t, i) => (
        <View key={i} style={s.bulletRow} wrap={false}>
          <Text style={s.bullet}>•</Text>
          <Text style={s.bulletText}>{t}</Text>
        </View>
      ))}
    </>
  );
}

function Section({ s, n, title, children }: { s: Styles; n: number; title: string; children: React.ReactNode }) {
  return (
    <View>
      {/* minPresenceAhead evita título órfão no fim da página */}
      <View style={s.h2Wrap} minPresenceAhead={70} wrap={false}>
        <Text style={s.h2Num}>{n}.</Text>
        <Text style={s.h2}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export function ProposalDocument({ proposal, company }: { proposal: Proposal; company: CompanyProfile }) {
  const theme = buildTheme(company.primaryColor);
  const s = makeStyles(theme);
  const { input, content } = proposal;
  
  // Campos comerciais dinâmicos definidos pelo usuário (sem campos em branco)
  const pricingRows: [string, string][] = (input.pricingFields && input.pricingFields.length > 0)
    ? input.pricingFields
        .filter((f) => f.label?.trim() && f.value?.trim())
        .map((f) => [f.label.trim(), f.value.trim()] as [string, string])
    : [
        ['Investimento à vista / implantação', input.priceUpfront || ''],
        ['Mensalidade', input.priceMonthly || ''],
        ['Prazo de vigência', input.validity || ''],
        ['Forma de faturamento', input.billing || ''],
        ['Condições de pagamento', input.paymentTerms || ''],
      ].filter(([, v]) => v.trim()) as [string, string][];

  const slaRows: [string, string][] = [
    ['SLA - Atendimento crítico', input.slaCritical],
    ['SLA - Atendimento normal', input.slaNormal],
    ['Modalidade de atendimento', input.slaMode],
  ].filter(([, v]) => v && v.trim()) as [string, string][];

  const filled = [...pricingRows, ...slaRows];

  // Blocos de destaque (pega os primeiros campos de valor/investimento se houver)
  const highlights = (
    pricingRows.filter(([label, val]) => /valor|investimento|mensal|total|implantação|taxa|produto|r\$|\$/i.test(label + ' ' + val)).length > 0
      ? pricingRows.filter(([label, val]) => /valor|investimento|mensal|total|implantação|taxa|produto|r\$|\$/i.test(label + ' ' + val))
      : pricingRows
  ).slice(0, 2);
  const contactLine = [company.cnpj && `CNPJ ${company.cnpj}`, company.phone, company.email].filter(Boolean).join('  |  ');
  const info = [
    ['Cliente', input.clientName],
    ['Contato', input.clientContact],
    ['E-mail', input.clientEmail],
    ['Data de emissão', fmtDate(proposal.createdAt)],
  ].filter(([, v]) => v);

  return (
    <Document title={`Proposta ${proposal.number}`} author={company.name} creator="OrçaLivre">
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {company.logo ? <Image src={company.logo} style={s.logo} /> : <Text style={s.companyName}>{company.name || 'Sua Empresa'}</Text>}
          </View>
          <View style={s.headRight}>
            {company.logo && <Text style={s.companyName}>{company.name}</Text>}
            <Text style={s.companyMeta}>{contactLine}</Text>
            {!!company.address && <Text style={s.companyMeta}>{company.address}</Text>}
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text>Proposta {proposal.number} • {company.name}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>

        <View style={s.titleBar} wrap={false}>
          <Text style={s.title}>Proposta Comercial</Text>
          <Text style={s.subtitle}>{input.projectType} • Nº {proposal.number}</Text>
        </View>

        <View style={s.infoBox} wrap={false}>
          {info.map(([k, v], i) => (
            <View key={k} style={[s.infoRow, i === info.length - 1 ? { borderBottomWidth: 0 } : {}]}>
              <Text style={s.infoLabel}>{k}</Text>
              <Text style={s.infoValue}>{v}</Text>
            </View>
          ))}
        </View>

        <Section s={s} n={1} title="Objetivo do Projeto"><Paragraphs s={s} text={content.objetivo} /></Section>
        <Section s={s} n={2} title="Escopo Detalhado das Entregas"><Bullets s={s} items={content.escopo} /></Section>
        <Section s={s} n={3} title="Limites de Escopo (O que NÃO está incluso)"><Bullets s={s} items={content.limites} /></Section>
        <Section s={s} n={4} title="Termos de SLA & Prazos"><Paragraphs s={s} text={content.sla} /></Section>

        <Section s={s} n={5} title="Condições Comerciais & Investimento">
          {highlights.length > 0 && (
            <View style={s.highlights} wrap={false}>
              {highlights.map(([k, v], i) => (
                <View key={k} style={[s.hlBox, i === highlights.length - 1 ? { marginRight: 0 } : {}]}>
                  <Text style={s.hlLabel}>{k}</Text>
                  <Text style={s.hlValue}>{v}</Text>
                </View>
              ))}
            </View>
          )}
          {filled.length > 0 && (
            <View style={s.table} wrap={false}>
              <View style={s.th}>
                <Text style={s.td1}>Item</Text>
                <Text style={s.td2}>Detalhe</Text>
              </View>
              {filled.map(([k, v], i) => (
                <View key={k} style={[s.tr, i % 2 ? s.trAlt : {}]}>
                  <Text style={[s.td1, { fontFamily: 'Helvetica-Bold' }]}>{k}</Text>
                  <Text style={s.td2}>{v}</Text>
                </View>
              ))}
            </View>
          )}
          <Paragraphs s={s} text={content.condicoes} />
        </Section>

        {!!company.defaultTerms.trim() && (
          <View style={s.terms}>
            <Section s={s} n={6} title="Termos Gerais e Validade"><Paragraphs s={s} text={company.defaultTerms} /></Section>
          </View>
        )}

        {/* Bloco de aceite + assinaturas: nunca é dividido entre páginas */}
        <View style={s.acceptBlock} wrap={false}>
          <Text style={s.acceptTitle}>Aceite</Text>
          <Text style={s.acceptText}>
            As partes declaram ter lido e concordado com as condições desta proposta, que passa a vigorar a partir da data de assinatura.
          </Text>
          <View style={s.sigWrap}>
            <View style={s.sigBox}>
              <View style={s.sigLine} />
              <Text style={s.sigName}>{company.name || 'Prestador'}</Text>
              <Text style={s.sigSub}>CONTRATADA{company.cnpj ? ` • CNPJ ${company.cnpj}` : ''}</Text>
            </View>
            <View style={s.sigBox}>
              <View style={s.sigLine} />
              <Text style={s.sigName}>{input.clientName || 'Cliente'}</Text>
              <Text style={s.sigSub}>CONTRATANTE{input.clientContact ? ` • ${input.clientContact}` : ''}</Text>
            </View>
          </View>
          <Text style={[s.sigSub, { marginTop: 22 }]}>Local e data: ______________________, ____ / ____ / ________</Text>
        </View>
      </Page>
    </Document>
  );
}
