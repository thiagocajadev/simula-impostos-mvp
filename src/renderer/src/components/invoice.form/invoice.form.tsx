import { ArrowLeft, FileText, Save, Send } from "lucide-react";
import { format, REGIME_LABELS } from "../../invoice.format";
import { useInvoiceStore } from "../../invoice.store";
import { CurrentTaxesSection } from "./current-taxes.section";
import { ItemsSection } from "./items.section";
import { ReformTaxesSection } from "./reform-taxes.section";
import { RegimeSection } from "./regime.section";
import { TotalsSection } from "./totals.section";

function PartyFields({
  title,
  party,
  onChange,
}: {
  title: string;
  party: Record<string, string>;
  onChange: (field: string, value: string) => void;
}) {
  const id = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{title}</h3>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          <label htmlFor={`${id}-companyName`} className="label">
            Razão Social
          </label>
          <input
            id={`${id}-companyName`}
            className="input"
            value={party.companyName}
            onChange={(e) => onChange("companyName", e.target.value)}
            placeholder="Nome ou Razão Social"
          />
        </div>
        <div className="col-span-3">
          <label htmlFor={`${id}-cnpj`} className="label">
            CNPJ / CPF
          </label>
          <input
            id={`${id}-cnpj`}
            className="input"
            value={party.cnpj}
            onChange={(e) => onChange("cnpj", e.target.value)}
            placeholder="00.000.000/0001-00"
            maxLength={18}
          />
        </div>
        <div className="col-span-3">
          <label htmlFor={`${id}-ie`} className="label">
            Insc. Estadual
          </label>
          <input
            id={`${id}-ie`}
            className="input"
            value={party.ie}
            onChange={(e) => onChange("ie", e.target.value)}
            placeholder="IE ou ISENTO"
          />
        </div>
        <div className="col-span-2">
          <label htmlFor={`${id}-zipCode`} className="label">
            CEP
          </label>
          <input
            id={`${id}-zipCode`}
            className="input"
            value={party.zipCode}
            onChange={(e) => onChange("zipCode", e.target.value)}
            placeholder="00000-000"
            maxLength={9}
          />
        </div>
        <div className="col-span-5">
          <label htmlFor={`${id}-address`} className="label">
            Endereço
          </label>
          <input
            id={`${id}-address`}
            className="input"
            value={party.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Rua / Av."
          />
        </div>
        <div className="col-span-1">
          <label htmlFor={`${id}-number`} className="label">
            Nº
          </label>
          <input
            id={`${id}-number`}
            className="input"
            value={party.number}
            onChange={(e) => onChange("number", e.target.value)}
          />
        </div>
        <div className="col-span-4">
          <label htmlFor={`${id}-neighborhood`} className="label">
            Bairro
          </label>
          <input
            id={`${id}-neighborhood`}
            className="input"
            value={party.neighborhood}
            onChange={(e) => onChange("neighborhood", e.target.value)}
          />
        </div>
        <div className="col-span-4">
          <label htmlFor={`${id}-city`} className="label">
            Município
          </label>
          <input
            id={`${id}-city`}
            className="input"
            value={party.city}
            onChange={(e) => onChange("city", e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label htmlFor={`${id}-state`} className="label">
            UF
          </label>
          <input
            id={`${id}-state`}
            className="input uppercase"
            value={party.state}
            onChange={(e) => onChange("state", e.target.value.toUpperCase())}
            maxLength={2}
          />
        </div>
      </div>
    </div>
  );
}

function InvoiceForm() {
  const { currentInvoice, setPage, saveInvoice, setField, setIssuer, setRecipient } =
    useInvoiceStore();

  if (!currentInvoice) {
    return null;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage("list")}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <h1 className="text-xl font-bold text-slate-800">
                NF-e Simulada — {format.invoiceNumber(currentInvoice.number)}/
                {currentInvoice.series}
              </h1>
              <span
                className={currentInvoice.status === "emitida" ? "badge-emitida" : "badge-rascunho"}
              >
                {currentInvoice.status === "emitida" ? "Emitida" : "Rascunho"}
              </span>
            </div>
            <p className="text-xs text-slate-400 ml-7">
              Regime:{" "}
              <span className="font-medium text-slate-600">
                {REGIME_LABELS[currentInvoice.taxRegime]}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => saveInvoice("rascunho")} className="btn-secondary">
            <Save size={15} />
            Salvar Rascunho
          </button>
          <button type="button" onClick={() => saveInvoice("emitida")} className="btn-success">
            <Send size={15} />
            Emitir NF
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <section className="card p-5">
          <h2 className="section-title mb-4">Dados da Nota Fiscal</h2>
          <div className="grid grid-cols-4 gap-3 mb-5">
            <div>
              <label htmlFor="nf-operationNature" className="label">
                Natureza da Operação
              </label>
              <input
                id="nf-operationNature"
                className="input"
                value={currentInvoice.operationNature}
                onChange={(e) => setField("operationNature", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="nf-issueDate" className="label">
                Data de Emissão
              </label>
              <input
                id="nf-issueDate"
                type="date"
                className="input"
                value={currentInvoice.issueDate}
                onChange={(e) => setField("issueDate", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="nf-series" className="label">
                Série
              </label>
              <input
                id="nf-series"
                className="input"
                value={currentInvoice.series}
                onChange={(e) => setField("series", e.target.value)}
                maxLength={3}
              />
            </div>
          </div>

          <div className="space-y-5">
            <PartyFields
              title="Emitente"
              party={currentInvoice.issuer as unknown as Record<string, string>}
              onChange={setIssuer}
            />
            <div className="border-t border-slate-100 pt-5">
              <PartyFields
                title="Destinatário"
                party={currentInvoice.recipient as unknown as Record<string, string>}
                onChange={setRecipient}
              />
            </div>
          </div>
        </section>

        <RegimeSection />
        <ItemsSection />

        <div className="grid grid-cols-2 gap-4">
          <CurrentTaxesSection />
          <ReformTaxesSection />
        </div>

        <TotalsSection />

        <section className="card p-5">
          <h2 className="section-title mb-3">Informações Adicionais</h2>
          <textarea
            className="input h-20 resize-none"
            value={currentInvoice.additionalInfo}
            onChange={(e) => setField("additionalInfo", e.target.value)}
            placeholder="Observações, dados complementares, referências..."
          />
        </section>

        <div className="flex justify-end gap-3 pb-6">
          <button type="button" onClick={() => setPage("list")} className="btn-secondary">
            <ArrowLeft size={15} />
            Cancelar
          </button>
          <button type="button" onClick={() => saveInvoice("rascunho")} className="btn-secondary">
            <Save size={15} />
            Salvar Rascunho
          </button>
          <button type="button" onClick={() => saveInvoice("emitida")} className="btn-success">
            <Send size={15} />
            Emitir Nota Fiscal
          </button>
        </div>
      </div>
    </div>
  );
}

export { InvoiceForm };
