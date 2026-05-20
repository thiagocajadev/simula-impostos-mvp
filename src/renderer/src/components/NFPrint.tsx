import { ArrowLeft, Printer } from "lucide-react";
import React from "react";
import { useNFStore } from "../store/useNFStore";
import type { CurrentTaxes, Invoice, ReformTaxes } from "../types";
import { fmt, REGIME_LABELS } from "../utils/formatters";
import { CURRENT_TAX_LABELS, REFORM_TAX_LABELS } from "../utils/taxCalculator";

function HorizontalRule() {
  return <div style={{ borderTop: "1px solid #333", margin: "2px 0" }} />;
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div
        style={{
          fontSize: 7,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#555",
          marginBottom: 1,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 9,
          color: "#111",
          fontFamily: mono ? "monospace" : "inherit",
          fontWeight: 500,
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function TaxCell({
  name,
  amount,
  rate,
  enabled,
}: {
  name: string;
  amount: number;
  rate: number;
  enabled: boolean;
}) {
  return (
    <td
      style={{
        border: "1px solid #ccc",
        padding: "3px 5px",
        textAlign: "right",
        opacity: enabled ? 1 : 0.35,
      }}
    >
      <div style={{ fontSize: 7, color: "#777", fontWeight: 700, textTransform: "uppercase" }}>
        {name}
      </div>
      <div style={{ fontSize: 7, color: "#555" }}>{rate}%</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: enabled ? "#333" : "#bbb" }}>
        {fmt.currency(amount)}
      </div>
    </td>
  );
}

function DanfeContent({ invoice }: { invoice: Invoice }) {
  const subtotal = invoice.totalProducts + invoice.totalServices;
  const currentTaxKeys = Object.keys(CURRENT_TAX_LABELS) as (keyof CurrentTaxes)[];
  const reformTaxKeys = Object.keys(REFORM_TAX_LABELS) as (keyof ReformTaxes)[];

  return (
    <div
      style={{
        fontFamily: "'Arial', sans-serif",
        fontSize: 9,
        color: "#111",
        backgroundColor: "#fff",
        padding: "12mm 10mm",
        maxWidth: "210mm",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 200px 130px",
          gap: 0,
          border: "2px solid #333",
          marginBottom: 4,
        }}
      >
        <div style={{ padding: "6px 8px", borderRight: "1px solid #333" }}>
          <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 2 }}>
            {invoice.issuer.companyName}
          </div>
          <div style={{ fontSize: 8, color: "#444" }}>
            {invoice.issuer.address}, {invoice.issuer.number} — {invoice.issuer.neighborhood}
          </div>
          <div style={{ fontSize: 8, color: "#444" }}>
            {invoice.issuer.city} - {invoice.issuer.state} — CEP{" "}
            {fmt.zipCode(invoice.issuer.zipCode)}
          </div>
          <div style={{ fontSize: 8, color: "#444", marginTop: 2 }}>
            CNPJ: {fmt.cnpj(invoice.issuer.cnpj)} — IE: {invoice.issuer.ie}
          </div>
        </div>

        <div
          style={{
            padding: "6px 8px",
            textAlign: "center",
            borderRight: "1px solid #333",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", color: "#c00" }}>
            DANFE
          </div>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#c00" }}>Documento Auxiliar da</div>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#c00" }}>Nota Fiscal Eletrônica</div>
          <div
            style={{
              marginTop: 6,
              padding: "2px 6px",
              background: "#fff3cd",
              border: "1px solid #f0ad00",
              borderRadius: 3,
              fontSize: 7,
              fontWeight: 700,
              color: "#856404",
            }}
          >
            ⚠ DOCUMENTO SIMULADO
          </div>
          <div style={{ marginTop: 4, fontSize: 7, color: "#666" }}>
            Sem validade fiscal/jurídica
          </div>
        </div>

        <div style={{ padding: "6px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#555", marginBottom: 2 }}>
            NF-e Nº
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, fontFamily: "monospace" }}>
            {fmt.invoiceNumber(invoice.number)}
          </div>
          <div style={{ fontSize: 8, color: "#555", marginTop: 2 }}>Série: {invoice.series}</div>
          <div style={{ fontSize: 8, color: "#555", marginTop: 4 }}>
            Emissão: {fmt.date(invoice.issueDate)}
          </div>
          <div
            style={{
              marginTop: 6,
              padding: "2px 4px",
              background: invoice.status === "emitida" ? "#d1fae5" : "#fef3c7",
              borderRadius: 3,
              fontSize: 7,
              fontWeight: 700,
              color: invoice.status === "emitida" ? "#065f46" : "#92400e",
            }}
          >
            {invoice.status === "emitida" ? "● EMITIDA" : "● RASCUNHO"}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 4,
          border: "1px solid #ccc",
          padding: "4px 8px",
          marginBottom: 4,
        }}
      >
        <Field label="Natureza da Operação" value={invoice.operationNature} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 7, fontWeight: 700, color: "#555", textTransform: "uppercase" }}>
            Regime Tributário
          </div>
          <div style={{ fontSize: 9, fontWeight: 700 }}>{REGIME_LABELS[invoice.taxRegime]}</div>
        </div>
      </div>

      <div style={{ border: "1px solid #ccc", padding: "4px 8px", marginBottom: 4 }}>
        <div
          style={{
            fontSize: 7,
            fontWeight: 900,
            textTransform: "uppercase",
            color: "#333",
            marginBottom: 4,
            borderBottom: "1px solid #eee",
            paddingBottom: 2,
          }}
        >
          Destinatário / Remetente
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0 16px" }}>
          <Field label="Razão Social" value={invoice.recipient.companyName} />
          <Field label="CNPJ / CPF" value={fmt.cnpj(invoice.recipient.cnpj)} mono />
          <Field label="Insc. Estadual" value={invoice.recipient.ie} />
          <Field
            label="Endereço"
            value={`${invoice.recipient.address}, ${invoice.recipient.number}`}
          />
          <Field label="Município" value={invoice.recipient.city} />
          <Field
            label="UF / CEP"
            value={`${invoice.recipient.state} — ${fmt.zipCode(invoice.recipient.zipCode)}`}
          />
        </div>
      </div>

      <div style={{ border: "1px solid #ccc", marginBottom: 4, overflow: "hidden" }}>
        <div
          style={{
            fontSize: 7,
            fontWeight: 900,
            textTransform: "uppercase",
            color: "#333",
            padding: "3px 8px",
            background: "#f5f5f5",
            borderBottom: "1px solid #ccc",
          }}
        >
          Dados dos Produtos / Serviços
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8 }}>
          <thead>
            <tr style={{ background: "#f9f9f9" }}>
              {["#", "Código", "Descrição", "NCM", "CFOP", "UN", "Qtd", "Vl Unit", "Vl Total"].map(
                (header) => (
                  <th
                    key={header}
                    style={{
                      padding: "2px 4px",
                      borderBottom: "1px solid #ccc",
                      textAlign: header === "Descrição" ? "left" : "right",
                      fontSize: 7,
                      fontWeight: 700,
                      color: "#555",
                      textTransform: "uppercase",
                    }}
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {invoice.items.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    color: "#aaa",
                    fontStyle: "italic",
                  }}
                >
                  Nenhum item
                </td>
              </tr>
            ) : (
              invoice.items.map((item, index) => (
                <tr key={item.id} style={{ background: index % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "2px 4px", textAlign: "right", color: "#999" }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: "2px 4px", textAlign: "right", fontFamily: "monospace" }}>
                    {item.type === "produto" ? "PROD" : "SERV"}
                  </td>
                  <td style={{ padding: "2px 4px", textAlign: "left", fontWeight: 600 }}>
                    {item.description}
                  </td>
                  <td style={{ padding: "2px 4px", textAlign: "right", fontFamily: "monospace" }}>
                    {item.ncm || "—"}
                  </td>
                  <td style={{ padding: "2px 4px", textAlign: "right", fontFamily: "monospace" }}>
                    {item.cfop}
                  </td>
                  <td style={{ padding: "2px 4px", textAlign: "right" }}>{item.unit}</td>
                  <td style={{ padding: "2px 4px", textAlign: "right" }}>
                    {item.quantity.toLocaleString("pt-BR")}
                  </td>
                  <td style={{ padding: "2px 4px", textAlign: "right" }}>
                    {fmt.currency(item.unitPrice)}
                  </td>
                  <td style={{ padding: "2px 4px", textAlign: "right", fontWeight: 700 }}>
                    {fmt.currency(item.totalPrice)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 4 }}>
        <div style={{ border: "2px solid #f97316", borderRadius: 4, overflow: "hidden" }}>
          <div
            style={{
              background: "#fff7ed",
              borderBottom: "1px solid #f97316",
              padding: "3px 8px",
              fontSize: 7,
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#c2410c",
            }}
          >
            Impostos — Regime Atual
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                {currentTaxKeys.map((key) => (
                  <TaxCell
                    key={key}
                    name={CURRENT_TAX_LABELS[key]}
                    amount={invoice.taxes.current[key].amount}
                    rate={invoice.taxes.current[key].rate}
                    enabled={invoice.taxes.current[key].enabled}
                  />
                ))}
              </tr>
            </tbody>
          </table>
          <div
            style={{
              background: "#fff7ed",
              borderTop: "1px solid #f97316",
              padding: "3px 8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontSize: 7, fontWeight: 700, color: "#c2410c", textTransform: "uppercase" }}
            >
              Total Impostos (Atual)
            </span>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#c2410c" }}>
              {fmt.currency(invoice.totalCurrentTaxes)}
            </span>
          </div>
        </div>

        <div style={{ border: "2px solid #3b82f6", borderRadius: 4, overflow: "hidden" }}>
          <div
            style={{
              background: "#eff6ff",
              borderBottom: "1px solid #3b82f6",
              padding: "3px 8px",
              fontSize: 7,
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#1d4ed8",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Impostos — Pós Reforma (EC 132/2023)</span>
            <span
              style={{ fontSize: 6, background: "#dbeafe", padding: "1px 4px", borderRadius: 2 }}
            >
              Estimativa
            </span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                {reformTaxKeys.map((key) => (
                  <TaxCell
                    key={key}
                    name={REFORM_TAX_LABELS[key]}
                    amount={invoice.taxes.reform[key].amount}
                    rate={invoice.taxes.reform[key].rate}
                    enabled={invoice.taxes.reform[key].enabled}
                  />
                ))}
              </tr>
            </tbody>
          </table>
          <div
            style={{
              background: "#eff6ff",
              borderTop: "1px solid #3b82f6",
              padding: "3px 8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontSize: 7, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase" }}
            >
              Total Impostos (Reforma)
            </span>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#1d4ed8" }}>
              {fmt.currency(invoice.totalReformTaxes)}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          border: "2px solid #1e293b",
          borderRadius: 4,
          padding: "6px 10px",
          marginBottom: 4,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 7, fontWeight: 700, color: "#555", textTransform: "uppercase" }}>
            Subtotal (Prod + Serv)
          </div>
          <div style={{ fontSize: 13, fontWeight: 900 }}>{fmt.currency(subtotal)}</div>
        </div>
        <div
          style={{
            textAlign: "center",
            borderLeft: "1px solid #e2e8f0",
            borderRight: "1px solid #e2e8f0",
            padding: "0 8px",
          }}
        >
          <div
            style={{ fontSize: 7, fontWeight: 700, color: "#c2410c", textTransform: "uppercase" }}
          >
            Total Impostos (Regime Atual)
          </div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#c2410c" }}>
            {fmt.currency(invoice.totalCurrentTaxes)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 7, fontWeight: 700, color: "#333", textTransform: "uppercase" }}>
            Valor Total da NF
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#1e293b" }}>
            {fmt.currency(invoice.totalInvoice)}
          </div>
        </div>
      </div>

      {invoice.additionalInfo && (
        <div
          style={{ border: "1px solid #ccc", padding: "4px 8px", marginBottom: 4, borderRadius: 2 }}
        >
          <div
            style={{
              fontSize: 7,
              fontWeight: 700,
              color: "#555",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Informações Adicionais
          </div>
          <div style={{ fontSize: 8 }}>{invoice.additionalInfo}</div>
        </div>
      )}

      <HorizontalRule />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 4,
          fontSize: 7,
          color: "#888",
        }}
      >
        <span>
          Simula Impostos BR — Documento Simulado para fins educacionais e de demonstração
        </span>
        <span>Gerado em {new Date().toLocaleString("pt-BR")}</span>
      </div>
    </div>
  );
}

export function NFPrint() {
  const { currentInvoice, setPage, editInvoice } = useNFStore();
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  if (!currentInvoice) {
    return null;
  }

  const fileName = `NF-e-Simulada-${fmt.invoiceNumber(currentInvoice.number)}-${currentInvoice.series}`;

  const savePDF = async () => {
    setIsSaving(true);
    setFeedback(null);
    const result = await window.api.print.toPDF(fileName);
    setIsSaving(false);
    if (result.success) {
      setFeedback(`PDF salvo em: ${result.filePath}`);
    } else if (result.error) {
      setFeedback(`Erro: ${result.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200">
      <div className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage("list")}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={15} />
            Voltar
          </button>
          <span className="text-slate-600">|</span>
          <span className="text-sm text-slate-300">
            NF-e Simulada — {fmt.invoiceNumber(currentInvoice.number)}/{currentInvoice.series}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {feedback && <span className="text-xs text-slate-300 max-w-xs truncate">{feedback}</span>}
          {currentInvoice.status === "rascunho" && (
            <button
              type="button"
              onClick={() => editInvoice(currentInvoice)}
              className="btn-secondary text-slate-800 text-xs"
            >
              Editar
            </button>
          )}
          <button
            type="button"
            onClick={savePDF}
            disabled={isSaving}
            className="btn-primary text-sm"
          >
            <Printer size={15} />
            {isSaving ? "Gerando PDF..." : "Salvar como PDF"}
          </button>
        </div>
      </div>

      <div className="py-8 px-4 flex justify-center">
        <div className="bg-white shadow-2xl" style={{ width: "210mm", minHeight: "297mm" }}>
          <DanfeContent invoice={currentInvoice} />
        </div>
      </div>
    </div>
  );
}
