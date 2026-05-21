import { Info, Sparkles } from "lucide-react";
import { format } from "../../invoice.format";
import { useInvoiceStore } from "../../invoice.store";
import type { ReformTaxes } from "../../invoice.types";
import { REFORM_TAX_LABELS, TAX_DESCRIPTIONS } from "../../tax.calculate";

const REFORM_TAX_NOTES: Record<string, string> = {
  taxCbs: "Substitui PIS + COFINS. Alíquota estimada ~8,8%.",
  taxIbs: "Substitui ICMS + ISS. Alíquota varia por UF/Município. Estimativa ~17,7%.",
  taxIs: "Incide sobre produtos prejudiciais (fumo, bebidas, armas, veículos poluentes).",
};

function ReformTaxesSection() {
  const { currentInvoice, toggleTax, setTaxRate } = useInvoiceStore();
  if (!currentInvoice) {
    return null;
  }

  const taxes = currentInvoice.taxes.reform;
  const keys = Object.keys(REFORM_TAX_LABELS) as (keyof ReformTaxes)[];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <p className="text-xs text-slate-400">
          Novo sistema IVA dual: CBS (federal) + IBS (estadual/municipal) + IS (seletivo)
        </p>
        <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
          <Sparkles size={10} />
          EC 132/2023
        </span>
      </div>

      <div className="space-y-2">
        {keys.map((key) => {
          const tax = taxes[key];
          return (
            <div
              key={key}
              className={`imposto-row border-blue-100 bg-blue-50/50 ${!tax.enabled ? "opacity-50" : ""}`}
            >
              <label className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={tax.enabled}
                  onChange={() => toggleTax("reform", key)}
                  className="w-4 h-4 accent-blue-500 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-700">
                      {REFORM_TAX_LABELS[key]}
                    </span>
                    <div className="group relative">
                      <Info size={12} className="text-slate-400 cursor-help" />
                      <div
                        className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-10
                                      bg-slate-800 text-white text-xs rounded-lg px-3 py-2 w-64 shadow-xl"
                      >
                        <p className="font-semibold mb-0.5">{REFORM_TAX_LABELS[key]}</p>
                        <p className="text-slate-300">{TAX_DESCRIPTIONS[key]}</p>
                        <p className="text-blue-300 mt-1">{REFORM_TAX_NOTES[key]}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </label>

              <div className="text-right flex-shrink-0 w-28">
                <p className="text-xs text-slate-400">Base</p>
                <p className="text-xs font-mono font-medium text-slate-600">
                  {format.currency(tax.base)}
                </p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={tax.rate}
                  disabled={!tax.enabled}
                  onChange={(e) =>
                    setTaxRate("reform", key, Number.parseFloat(e.target.value) || 0)
                  }
                  className="w-20 px-2 py-1.5 text-sm text-right border border-blue-200 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-slate-100
                             font-mono"
                />
                <span className="text-sm text-slate-500">%</span>
              </div>

              <div className="text-right flex-shrink-0 w-28">
                <p className="text-xs text-slate-400">Valor</p>
                <p
                  className={`text-sm font-bold ${tax.enabled ? "text-blue-600" : "text-slate-300"}`}
                >
                  {format.currency(tax.amount)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ReformTaxesSection };
