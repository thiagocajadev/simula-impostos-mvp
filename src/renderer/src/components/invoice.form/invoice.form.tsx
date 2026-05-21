import {
  ArrowLeft,
  BarChart2,
  ChevronsDown,
  ChevronsUp,
  FileText,
  MessageSquare,
  Package,
  Receipt,
  Save,
  Scale,
  Send,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { format, REGIME_LABELS } from "../../invoice.format";
import { useInvoiceStore } from "../../invoice.store";
import { Accordion } from "./accordion";
import { CurrentTaxesSection } from "./current-taxes.section";
import { ItemsSection } from "./items.section";
import { ReformTaxesSection } from "./reform-taxes.section";
import { RegimeSection } from "./regime.section";
import { TotalsSection } from "./totals.section";

type SectionKey =
  | "regime"
  | "dados"
  | "itens"
  | "impostosAtual"
  | "impostosReforma"
  | "resumo"
  | "adicionais";

const CLOSED_ALL: Record<SectionKey, boolean> = {
  regime: false,
  dados: false,
  itens: false,
  impostosAtual: false,
  impostosReforma: false,
  resumo: false,
  adicionais: false,
};

function maskCnpjCpf(raw: string): string {
  const chars = raw
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 14);
  const hasLetter = /[A-Z]/.test(chars);

  if (!hasLetter && chars.length <= 11) {
    const cpfFormatted = chars
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return cpfFormatted;
  }

  const len = chars.length;
  if (len <= 2) {
    return chars;
  }
  if (len <= 5) {
    return `${chars.slice(0, 2)}.${chars.slice(2)}`;
  }
  if (len <= 8) {
    return `${chars.slice(0, 2)}.${chars.slice(2, 5)}.${chars.slice(5)}`;
  }
  if (len <= 12) {
    return `${chars.slice(0, 2)}.${chars.slice(2, 5)}.${chars.slice(5, 8)}/${chars.slice(8)}`;
  }
  const cnpjFormatted = `${chars.slice(0, 2)}.${chars.slice(2, 5)}.${chars.slice(5, 8)}/${chars.slice(8, 12)}-${chars.slice(12)}`;
  return cnpjFormatted;
}

function maskZipCode(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  return formatted;
}

function charToValue(c: string): number {
  return c.charCodeAt(0) - 48;
}

function cnpjCheckDigits(chars: string): string {
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const sum1 = chars
    .slice(0, 12)
    .split("")
    .reduce((acc, c, i) => acc + charToValue(c) * weights1[i], 0);
  const rem1 = sum1 % 11;
  const dv1 = rem1 <= 1 ? 0 : 11 - rem1;

  const base13 = `${chars.slice(0, 12)}${dv1}`;
  const sum2 = base13.split("").reduce((acc, c, i) => acc + charToValue(c) * weights2[i], 0);
  const rem2 = sum2 % 11;
  const dv2 = rem2 <= 1 ? 0 : 11 - rem2;

  const dvs = `${dv1}${dv2}`;
  return dvs;
}

function isValidCnpj(chars: string): boolean {
  if (chars.length !== 14) {
    return false;
  }
  const expectedDvs = cnpjCheckDigits(chars);
  const isValid = chars.slice(12) === expectedDvs;
  return isValid;
}

function isTestDocument(chars: string): boolean {
  return chars.length > 0 && new Set(chars).size === 1;
}

function validateDocument(value: string): string {
  const chars = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  if (chars.length === 0) {
    return "";
  }
  if (isTestDocument(chars)) {
    return "";
  }

  const isAllDigits = /^\d+$/.test(chars);

  if (isAllDigits && chars.length === 11) {
    return "";
  }

  if (chars.length === 14) {
    const cnpjIsValid = isValidCnpj(chars);
    const error = cnpjIsValid ? "" : "CNPJ inválido";
    return error;
  }

  const error = "CPF: 11 dígitos · CNPJ: 14 caracteres (alfanumérico)";
  return error;
}

function validateZipCode(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) {
    return "";
  }
  const error = digits.length !== 8 ? "CEP deve ter 8 dígitos" : "";
  return error;
}

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const errorRing = (field: string) =>
    fieldErrors[field] ? "border-red-400 focus:ring-red-400" : "";

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
          <label htmlFor={`${id}-taxId`} className="label">
            CNPJ / CPF
          </label>
          <input
            id={`${id}-taxId`}
            className={`input ${errorRing("taxId")}`}
            value={maskCnpjCpf(party.taxId)}
            onChange={(e) => onChange("taxId", maskCnpjCpf(e.target.value))}
            onBlur={(e) => {
              const error = validateDocument(e.target.value);
              setFieldErrors((prev) => ({ ...prev, taxId: error }));
            }}
            placeholder="00.000.000/0001-00"
            maxLength={18}
          />
          {fieldErrors.taxId && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.taxId}</p>}
        </div>
        <div className="col-span-3">
          <label htmlFor={`${id}-ie`} className="label">
            Insc. Estadual
          </label>
          <input
            id={`${id}-ie`}
            className="input"
            value={party.stateRegistration}
            onChange={(e) => onChange("stateRegistration", e.target.value)}
            placeholder="IE ou ISENTO"
          />
        </div>
        <div className="col-span-2">
          <label htmlFor={`${id}-zipCode`} className="label">
            CEP
          </label>
          <input
            id={`${id}-zipCode`}
            className={`input ${errorRing("zipCode")}`}
            value={maskZipCode(party.zipCode)}
            onChange={(e) => onChange("zipCode", maskZipCode(e.target.value))}
            onBlur={(e) => {
              const error = validateZipCode(e.target.value);
              setFieldErrors((prev) => ({ ...prev, zipCode: error }));
            }}
            placeholder="00000-000"
            maxLength={9}
          />
          {fieldErrors.zipCode && (
            <p className="text-xs text-red-500 mt-0.5">{fieldErrors.zipCode}</p>
          )}
        </div>
        <div className="col-span-6">
          <label htmlFor={`${id}-address`} className="label">
            Endereço
          </label>
          <input
            id={`${id}-address`}
            className="input"
            value={party.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Rua, Av., Travessa..."
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
            placeholder="S/N"
          />
        </div>
        <div className="col-span-3">
          <label htmlFor={`${id}-neighborhood`} className="label">
            Bairro
          </label>
          <input
            id={`${id}-neighborhood`}
            className="input"
            value={party.neighborhood}
            onChange={(e) => onChange("neighborhood", e.target.value)}
            placeholder="Centro"
          />
        </div>
        <div className="col-span-10">
          <label htmlFor={`${id}-city`} className="label">
            Município
          </label>
          <input
            id={`${id}-city`}
            className="input"
            value={party.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="São Paulo"
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
            placeholder="SP"
            maxLength={2}
          />
        </div>
      </div>
    </div>
  );
}

function InvoiceForm() {
  const { currentInvoice, setPage, saveInvoice, setField, setIssuer, setRecipient, fillDemo } =
    useInvoiceStore();
  const [open, setOpen] = useState<Record<SectionKey, boolean>>(CLOSED_ALL);

  if (!currentInvoice) {
    return null;
  }

  const toggle = (key: SectionKey) =>
    setOpen((previous) => ({ ...previous, [key]: !previous[key] }));

  const allExpanded = Object.values(open).every(Boolean);

  const toggleAll = () => {
    const nextState = !allExpanded;
    setOpen({
      regime: nextState,
      dados: nextState,
      itens: nextState,
      impostosAtual: nextState,
      impostosReforma: nextState,
      resumo: nextState,
      adicionais: nextState,
    });
  };

  const subtotal = currentInvoice.totalProducts + currentInvoice.totalServices;
  const itemCount = currentInvoice.items.length;
  const reformDiff = currentInvoice.totalReformTaxes - currentInvoice.totalCurrentTaxes;

  const issuerSummary = currentInvoice.issuer.companyName ? (
    <span className="text-xs text-slate-500 truncate max-w-[220px]">
      {currentInvoice.issuer.companyName}
    </span>
  ) : (
    <span className="text-xs text-slate-400 italic">Não informado</span>
  );

  const regimeSummary = (
    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
      {REGIME_LABELS[currentInvoice.taxRegime]}
    </span>
  );

  const itemsSummary =
    itemCount > 0 ? (
      <span className="text-xs text-slate-500">
        {itemCount} {itemCount === 1 ? "item" : "itens"} —{" "}
        <span className="font-mono font-medium">{format.currency(subtotal)}</span>
      </span>
    ) : (
      <span className="text-xs text-slate-400 italic">Nenhum item</span>
    );

  const currentTaxesSummary = (
    <span className="text-xs font-mono font-medium text-orange-600">
      {format.currency(currentInvoice.totalCurrentTaxes)}
    </span>
  );

  const reformTaxesSummary = (
    <span className="text-xs font-mono font-medium text-blue-600">
      {format.currency(currentInvoice.totalReformTaxes)}
    </span>
  );

  const diffColor =
    reformDiff < 0 ? "text-emerald-600" : reformDiff > 0 ? "text-red-500" : "text-slate-400";

  const totalsSummary =
    subtotal > 0 ? (
      <span className={`text-xs font-medium ${diffColor}`}>
        {reformDiff < 0 ? "↓" : reformDiff > 0 ? "↑" : "="} {format.currency(Math.abs(reformDiff))}
      </span>
    ) : undefined;

  const additionalInfoSummary = currentInvoice.additionalInfo ? (
    <span className="text-xs text-slate-400 italic max-w-[220px] truncate">
      {currentInvoice.additionalInfo.slice(0, 40)}
      {currentInvoice.additionalInfo.length > 40 ? "…" : ""}
    </span>
  ) : (
    <span className="text-xs text-slate-400 italic">Vazio</span>
  );

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
                className={currentInvoice.status === "issued" ? "badge-emitida" : "badge-rascunho"}
              >
                {currentInvoice.status === "issued" ? "Emitida" : "Rascunho"}
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
          {currentInvoice.status === "draft" && (
            <button type="button" onClick={fillDemo} className="btn-secondary">
              <Sparkles size={15} />
              Gerar demonstração
            </button>
          )}
          <button type="button" onClick={toggleAll} className="btn-secondary">
            {allExpanded ? <ChevronsUp size={15} /> : <ChevronsDown size={15} />}
            {allExpanded ? "Recolher todos" : "Expandir todos"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <Accordion
          title="Regime Tributário"
          icon={<Scale size={15} className="text-slate-500" />}
          isOpen={open.regime}
          onToggle={() => toggle("regime")}
          summary={regimeSummary}
        >
          <RegimeSection />
        </Accordion>

        <Accordion
          title="Dados da Nota Fiscal"
          icon={<FileText size={15} className="text-slate-500" />}
          isOpen={open.dados}
          onToggle={() => toggle("dados")}
          summary={issuerSummary}
        >
          <div className="grid grid-cols-12 gap-3 mb-5">
            <div className="col-span-6">
              <label htmlFor="nf-operationNature" className="label">
                Natureza da Operação
              </label>
              <input
                id="nf-operationNature"
                className="input"
                value={currentInvoice.operationNature}
                onChange={(e) => setField("operationNature", e.target.value)}
                placeholder="Venda de mercadoria"
              />
            </div>
            <div className="col-span-4">
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
            <div className="col-span-2">
              <label htmlFor="nf-series" className="label">
                Série
              </label>
              <input
                id="nf-series"
                className="input"
                value={currentInvoice.series}
                onChange={(e) => setField("series", e.target.value)}
                placeholder="001"
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
        </Accordion>

        <Accordion
          title="Itens da Nota"
          icon={<Package size={15} className="text-slate-500" />}
          isOpen={open.itens}
          onToggle={() => toggle("itens")}
          summary={itemsSummary}
        >
          <ItemsSection />
        </Accordion>

        <div className="grid grid-cols-2 gap-3">
          <Accordion
            title="Impostos — Regime Atual"
            icon={<Receipt size={15} className="text-orange-500" />}
            isOpen={open.impostosAtual}
            onToggle={() => toggle("impostosAtual")}
            summary={currentTaxesSummary}
          >
            <CurrentTaxesSection />
          </Accordion>

          <Accordion
            title="Impostos — Pós Reforma"
            icon={<Sparkles size={15} className="text-blue-500" />}
            isOpen={open.impostosReforma}
            onToggle={() => toggle("impostosReforma")}
            summary={reformTaxesSummary}
            className="bg-gradient-to-br from-blue-50/30 to-white"
          >
            <ReformTaxesSection />
          </Accordion>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="card px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Total — Regime Atual</span>
            <span className="text-xl font-bold text-orange-600">
              {format.currency(currentInvoice.totalCurrentTaxes)}
            </span>
          </div>
          <div className="card px-5 py-3 flex items-center justify-between bg-gradient-to-br from-blue-50/30 to-white">
            <span className="text-sm font-semibold text-slate-600">Total — Pós Reforma</span>
            <span className="text-xl font-bold text-blue-600">
              {format.currency(currentInvoice.totalReformTaxes)}
            </span>
          </div>
        </div>

        <Accordion
          title="Resumo e Comparativo"
          icon={<BarChart2 size={15} className="text-slate-500" />}
          isOpen={open.resumo}
          onToggle={() => toggle("resumo")}
          summary={totalsSummary}
        >
          <TotalsSection />
        </Accordion>

        <Accordion
          title="Informações Adicionais"
          icon={<MessageSquare size={15} className="text-slate-500" />}
          isOpen={open.adicionais}
          onToggle={() => toggle("adicionais")}
          summary={additionalInfoSummary}
        >
          <textarea
            className="input h-20 resize-none"
            value={currentInvoice.additionalInfo}
            onChange={(e) => setField("additionalInfo", e.target.value)}
            placeholder="Observações, dados complementares, referências..."
          />
        </Accordion>

        <div className="flex justify-end gap-3 pb-6">
          <button type="button" onClick={() => setPage("list")} className="btn-secondary">
            <ArrowLeft size={15} />
            Cancelar
          </button>
          <button type="button" onClick={() => saveInvoice("draft")} className="btn-secondary">
            <Save size={15} />
            Salvar Rascunho
          </button>
          <button type="button" onClick={() => saveInvoice("issued")} className="btn-success">
            <Send size={15} />
            Emitir Nota Fiscal
          </button>
        </div>
      </div>
    </div>
  );
}

export { InvoiceForm };
