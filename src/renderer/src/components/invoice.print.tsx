import { ArrowLeft, Minus, Plus, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { format, REGIME_LABELS } from "../invoice.format";
import { useInvoiceStore } from "../invoice.store";
import type { CurrentTaxes, Invoice, ReformTaxes } from "../invoice.types";
import { CURRENT_TAX_LABELS, REFORM_TAX_LABELS } from "../tax.calculate";

const ZOOM_PRESETS = [50, 75, 90, 100, 125, 150];

function buildAccessKey(invoice: Invoice): string {
  const cnpj = invoice.issuer.cnpj.replace(/\D/g, "").padStart(14, "0").slice(0, 14);
  const year = invoice.issueDate.slice(2, 4);
  const month = invoice.issueDate.slice(5, 7);
  const series = invoice.series.replace(/\D/g, "").padStart(3, "0").slice(0, 3);
  const number = invoice.number.replace(/\D/g, "").padStart(9, "0").slice(0, 9);
  const raw = `35${year}${month}${cnpj}55${series}${number}100000010`;
  return raw.padEnd(44, "0").slice(0, 44);
}

function formatAccessKey(key: string): string {
  const groups = key.match(/.{1,4}/g) ?? [key];
  return groups.join(" ");
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
        border: "1px solid #ddd",
        padding: "3px 5px",
        textAlign: "right",
        opacity: enabled ? 1 : 0.3,
      }}
    >
      <div style={{ fontSize: 7, color: "#777", fontWeight: 700, textTransform: "uppercase" }}>
        {name}
      </div>
      <div style={{ fontSize: 7, color: "#999" }}>{rate}%</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: enabled ? "#333" : "#bbb" }}>
        {format.currency(amount)}
      </div>
    </td>
  );
}

function TaxTotalCell({ total, color }: { total: number; color: string }) {
  return (
    <td
      style={{
        border: `1px solid ${color}`,
        borderLeft: `3px solid ${color}`,
        padding: "3px 8px",
        textAlign: "right",
        background: `${color}10`,
        minWidth: 80,
      }}
    >
      <div
        style={{ fontSize: 7, color, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}
      >
        Total
      </div>
      <div style={{ fontSize: 12, fontWeight: 900, color }}>{format.currency(total)}</div>
    </td>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: 7,
        fontWeight: 900,
        textTransform: "uppercase",
        color: "#333",
        padding: "3px 8px",
        background: "#f5f5f5",
        borderBottom: "1px solid #ddd",
        letterSpacing: "0.06em",
      }}
    >
      {label}
    </div>
  );
}

function DanfeContent({ invoice }: { invoice: Invoice }) {
  const subtotal = invoice.totalProducts + invoice.totalServices;
  const currentTaxKeys = Object.keys(CURRENT_TAX_LABELS) as (keyof CurrentTaxes)[];
  const reformTaxKeys = Object.keys(REFORM_TAX_LABELS) as (keyof ReformTaxes)[];
  const reformDiff = invoice.totalReformTaxes - invoice.totalCurrentTaxes;
  const accessKey = buildAccessKey(invoice);

  return (
    <div
      style={{
        fontFamily: "'Arial', sans-serif",
        fontSize: 9,
        color: "#111",
        backgroundColor: "#fff",
        padding: "10mm 10mm",
        maxWidth: "210mm",
        margin: "0 auto",
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 190px 120px",
          border: "2px solid #222",
          marginBottom: 3,
        }}
      >
        <div style={{ padding: "6px 8px", borderRight: "1px solid #222" }}>
          <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 2, color: "#111" }}>
            {invoice.issuer.companyName || "EMITENTE NÃO INFORMADO"}
          </div>
          <div style={{ fontSize: 8, color: "#444", lineHeight: 1.4 }}>
            {invoice.issuer.address}
            {invoice.issuer.number ? `, ${invoice.issuer.number}` : ""} —{" "}
            {invoice.issuer.neighborhood}
          </div>
          <div style={{ fontSize: 8, color: "#444" }}>
            {invoice.issuer.city}
            {invoice.issuer.state ? ` - ${invoice.issuer.state}` : ""} — CEP{" "}
            {format.zipCode(invoice.issuer.zipCode)}
          </div>
          <div
            style={{
              marginTop: 4,
              paddingTop: 4,
              borderTop: "1px solid #eee",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 4,
            }}
          >
            <div>
              <div
                style={{ fontSize: 6, fontWeight: 700, color: "#777", textTransform: "uppercase" }}
              >
                CNPJ
              </div>
              <div style={{ fontSize: 8, fontFamily: "monospace" }}>
                {format.cnpj(invoice.issuer.cnpj)}
              </div>
            </div>
            <div>
              <div
                style={{ fontSize: 6, fontWeight: 700, color: "#777", textTransform: "uppercase" }}
              >
                Insc. Estadual
              </div>
              <div style={{ fontSize: 8 }}>{invoice.issuer.ie || "—"}</div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div
                style={{ fontSize: 6, fontWeight: 700, color: "#777", textTransform: "uppercase" }}
              >
                Regime Tributário
              </div>
              <div style={{ fontSize: 8, fontWeight: 700 }}>{REGIME_LABELS[invoice.taxRegime]}</div>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "8px",
            textAlign: "center",
            borderRight: "1px solid #222",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.12em", color: "#c00" }}>
            DANFE
          </div>
          <div style={{ fontSize: 7, fontWeight: 700, color: "#c00", lineHeight: 1.3 }}>
            Documento Auxiliar da
            <br />
            Nota Fiscal Eletrônica
          </div>
          <div
            style={{
              padding: "3px 6px",
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
          <div style={{ fontSize: 6, color: "#999" }}>Sem validade fiscal/jurídica</div>
        </div>

        <div
          style={{
            padding: "8px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <div>
            <div
              style={{ fontSize: 7, fontWeight: 700, color: "#777", textTransform: "uppercase" }}
            >
              NF-e Nº
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "monospace", color: "#111" }}>
              {format.invoiceNumber(invoice.number)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 7, color: "#777" }}>Série: {invoice.series}</div>
            <div style={{ fontSize: 7, color: "#777", marginTop: 2 }}>
              Emissão: {format.date(invoice.issueDate)}
            </div>
          </div>
          <div
            style={{
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

      {/* Chave de Acesso */}
      <div
        style={{
          border: "1px dashed #aaa",
          background: "#fafafa",
          padding: "4px 8px",
          marginBottom: 3,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 7,
            fontWeight: 700,
            color: "#555",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          Chave de Acesso (Simulada)
        </div>
        <div
          style={{
            fontSize: 8,
            fontFamily: "monospace",
            letterSpacing: "0.04em",
            color: "#222",
            flex: 1,
            textAlign: "center",
          }}
        >
          {formatAccessKey(accessKey)}
        </div>
      </div>

      {/* Natureza da Operação + Regime */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 0,
          border: "1px solid #ddd",
          padding: "4px 8px",
          marginBottom: 3,
        }}
      >
        <Field label="Natureza da Operação" value={invoice.operationNature} />
        <div style={{ textAlign: "right", paddingLeft: 16, borderLeft: "1px solid #eee" }}>
          <div style={{ fontSize: 7, fontWeight: 700, color: "#555", textTransform: "uppercase" }}>
            Regime Tributário
          </div>
          <div style={{ fontSize: 9, fontWeight: 700 }}>{REGIME_LABELS[invoice.taxRegime]}</div>
        </div>
      </div>

      {/* Destinatário */}
      <div style={{ border: "1px solid #ddd", marginBottom: 3, overflow: "hidden" }}>
        <SectionHeader label="Destinatário / Remetente" />
        <div style={{ padding: "4px 8px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0 16px" }}>
            <Field label="Razão Social" value={invoice.recipient.companyName} />
            <Field label="CNPJ / CPF" value={format.cnpj(invoice.recipient.cnpj)} mono />
            <Field label="Insc. Estadual" value={invoice.recipient.ie} />
            <Field
              label="Endereço"
              value={`${invoice.recipient.address}${invoice.recipient.number ? `, ${invoice.recipient.number}` : ""}`}
            />
            <Field label="Município" value={invoice.recipient.city} />
            <Field
              label="UF / CEP"
              value={`${invoice.recipient.state} — ${format.zipCode(invoice.recipient.zipCode)}`}
            />
          </div>
        </div>
      </div>

      {/* Itens */}
      <div style={{ border: "1px solid #ddd", marginBottom: 3, overflow: "hidden" }}>
        <SectionHeader label="Dados dos Produtos / Serviços" />
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8 }}>
          <thead>
            <tr style={{ background: "#f9f9f9" }}>
              {["#", "Tipo", "Descrição", "NCM", "CFOP", "UN", "Qtd", "Vl Unit", "Vl Total"].map(
                (header) => (
                  <th
                    key={header}
                    style={{
                      padding: "2px 4px",
                      borderBottom: "1px solid #ddd",
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
                    padding: "10px",
                    color: "#aaa",
                    fontStyle: "italic",
                    fontSize: 8,
                  }}
                >
                  Nenhum item adicionado
                </td>
              </tr>
            ) : (
              invoice.items.map((item, index) => (
                <tr key={item.id} style={{ background: index % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "2px 4px", textAlign: "right", color: "#bbb" }}>
                    {index + 1}
                  </td>
                  <td
                    style={{
                      padding: "2px 4px",
                      textAlign: "right",
                      fontFamily: "monospace",
                      fontSize: 7,
                      color: item.type === "produto" ? "#1d4ed8" : "#7c3aed",
                    }}
                  >
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
                    {format.currency(item.unitPrice)}
                  </td>
                  <td style={{ padding: "2px 4px", textAlign: "right", fontWeight: 700 }}>
                    {format.currency(item.totalPrice)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {invoice.items.length > 0 && (
            <tfoot>
              <tr style={{ background: "#f5f5f5" }}>
                <td
                  colSpan={7}
                  style={{
                    padding: "2px 4px",
                    borderTop: "1px solid #ddd",
                    fontSize: 7,
                    fontWeight: 700,
                    color: "#555",
                    textTransform: "uppercase",
                    textAlign: "right",
                  }}
                >
                  Subtotal
                </td>
                <td style={{ padding: "2px 4px", borderTop: "1px solid #ddd" }} />
                <td
                  style={{
                    padding: "2px 4px",
                    borderTop: "1px solid #ddd",
                    textAlign: "right",
                    fontWeight: 900,
                    fontSize: 10,
                  }}
                >
                  {format.currency(subtotal)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Cálculo do Imposto */}
      <div style={{ border: "1px solid #ddd", marginBottom: 3, overflow: "hidden" }}>
        <SectionHeader label="Cálculo do Imposto" />

        {/* Regime Atual */}
        <div style={{ borderBottom: "1px solid #eee" }}>
          <div
            style={{
              padding: "2px 8px",
              background: "#fff7ed",
              borderBottom: "1px solid #fed7aa",
              fontSize: 7,
              fontWeight: 700,
              color: "#c2410c",
              textTransform: "uppercase",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>▶ Regime Atual — Sistema Vigente</span>
            <span style={{ fontSize: 6, fontWeight: 400, color: "#9a3412" }}>
              ICMS · ISS · IPI · PIS · COFINS · IRPJ · CSLL
            </span>
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
                <TaxTotalCell total={invoice.totalCurrentTaxes} color="#ea580c" />
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pós Reforma */}
        <div>
          <div
            style={{
              padding: "2px 8px",
              background: "#eff6ff",
              borderBottom: "1px solid #bfdbfe",
              fontSize: 7,
              fontWeight: 700,
              color: "#1d4ed8",
              textTransform: "uppercase",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>▶ Pós Reforma (EC 132/2023) — IVA Dual</span>
            <span
              style={{
                fontSize: 6,
                background: "#dbeafe",
                padding: "1px 5px",
                borderRadius: 2,
                fontWeight: 400,
                color: "#1e40af",
              }}
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
                <TaxTotalCell total={invoice.totalReformTaxes} color="#2563eb" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Totais + Comparativo */}
      <div
        style={{
          border: "2px solid #1e293b",
          borderRadius: 4,
          overflow: "hidden",
          marginBottom: 3,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div style={{ padding: "6px 10px" }}>
            <div
              style={{ fontSize: 7, fontWeight: 700, color: "#555", textTransform: "uppercase" }}
            >
              Subtotal (Prod + Serv)
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, marginTop: 2 }}>
              {format.currency(subtotal)}
            </div>
            {subtotal > 0 && (
              <div style={{ fontSize: 7, color: "#888", marginTop: 2 }}>
                Prod: {format.currency(invoice.totalProducts)} · Serv:{" "}
                {format.currency(invoice.totalServices)}
              </div>
            )}
          </div>

          <div
            style={{
              padding: "6px 10px",
              borderLeft: "1px solid #e2e8f0",
              borderRight: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{ fontSize: 7, fontWeight: 700, color: "#c2410c", textTransform: "uppercase" }}
            >
              Total Impostos (Regime Atual)
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#c2410c", marginTop: 2 }}>
              {format.currency(invoice.totalCurrentTaxes)}
            </div>
          </div>

          <div style={{ padding: "6px 10px", textAlign: "right" }}>
            <div
              style={{ fontSize: 7, fontWeight: 700, color: "#1e293b", textTransform: "uppercase" }}
            >
              Valor Total da NF
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#1e293b", marginTop: 2 }}>
              {format.currency(invoice.totalInvoice)}
            </div>
          </div>
        </div>

        {subtotal > 0 && (
          <div
            style={{
              padding: "4px 10px",
              background: reformDiff < 0 ? "#f0fdf4" : reformDiff > 0 ? "#fef2f2" : "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{ fontSize: 7, fontWeight: 700, color: "#555", textTransform: "uppercase" }}
            >
              Comparativo — Pós Reforma (EC 132/2023)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 7, color: "#777" }}>Total Impostos Reforma</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#2563eb" }}>
                  {format.currency(invoice.totalReformTaxes)}
                </div>
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  color: reformDiff < 0 ? "#15803d" : reformDiff > 0 ? "#dc2626" : "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {reformDiff < 0 ? "↓" : reformDiff > 0 ? "↑" : "="}{" "}
                {format.currency(Math.abs(reformDiff))}
                <span style={{ fontSize: 7, fontWeight: 400 }}>
                  {reformDiff !== 0 &&
                    `(${Math.abs((reformDiff / invoice.totalCurrentTaxes) * 100).toFixed(1)}%)`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Informações Adicionais */}
      {invoice.additionalInfo && (
        <div
          style={{
            border: "1px solid #ddd",
            padding: "4px 8px",
            marginBottom: 3,
            borderRadius: 2,
          }}
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
          <div style={{ fontSize: 8, color: "#333", lineHeight: 1.5 }}>
            {invoice.additionalInfo}
          </div>
        </div>
      )}

      {/* Rodapé */}
      <div style={{ borderTop: "1px solid #ddd", paddingTop: 4, marginTop: 4 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 7,
            color: "#aaa",
          }}
        >
          <span>
            Simula Impostos BR — Documento simulado para fins educacionais e de demonstração
          </span>
          <span>Gerado em {new Date().toLocaleString("pt-BR")}</span>
        </div>
      </div>
    </div>
  );
}

function InvoicePrint() {
  const { currentInvoice, setPage, editInvoice } = useInvoiceStore();
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const area = scrollAreaRef.current;
    if (!area) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) {
        return;
      }
      event.preventDefault();
      const delta = event.deltaY < 0 ? 10 : -10;
      setZoom((previous) => Math.min(150, Math.max(50, previous + delta)));
    };

    area.addEventListener("wheel", handleWheel, { passive: false });
    return () => area.removeEventListener("wheel", handleWheel);
  }, []);

  if (!currentInvoice) {
    return null;
  }

  const fileName = `NF-e-Simulada-${format.invoiceNumber(currentInvoice.number)}-${currentInvoice.series}`;

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

  const zoomOut = () => setZoom((previous) => Math.max(50, previous - 10));
  const zoomIn = () => setZoom((previous) => Math.min(150, previous + 10));

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col">
      <div className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between flex-shrink-0">
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
            NF-e Simulada — {format.invoiceNumber(currentInvoice.number)}/{currentInvoice.series}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-slate-700 rounded-lg p-0.5">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= 50}
              className="w-7 h-7 flex items-center justify-center rounded text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={12} />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPresetOpen((previous) => !previous)}
                className="min-w-[52px] h-7 px-2 text-xs font-mono text-slate-200 hover:bg-slate-600 rounded transition-colors"
              >
                {zoom}%
              </button>

              {isPresetOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Fechar menu de zoom"
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setIsPresetOpen(false)}
                  />
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden z-20">
                    {ZOOM_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setZoom(preset);
                          setIsPresetOpen(false);
                        }}
                        className={`block w-full px-5 py-1.5 text-xs text-left font-mono transition-colors ${
                          preset === zoom
                            ? "bg-blue-600 text-white"
                            : "text-slate-300 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= 150}
              className="w-7 h-7 flex items-center justify-center rounded text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

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

      <div ref={scrollAreaRef} className="flex-1 overflow-auto py-8 px-4 flex justify-center">
        <div style={{ zoom: zoom / 100, transformOrigin: "top center" }}>
          <div className="bg-white shadow-2xl" style={{ width: "210mm", minHeight: "297mm" }}>
            <DanfeContent invoice={currentInvoice} />
          </div>
        </div>
      </div>
    </div>
  );
}

export { InvoicePrint };
