import { REGIME_LABELS } from "../../invoice.format";
import { useInvoiceStore } from "../../invoice.store";
import type { TaxRegime } from "../../invoice.types";

const REGIME_OPTIONS: { value: TaxRegime; description: string }[] = [
  {
    value: "simples_nacional",
    description: "Receita bruta anual até R$ 4,8 milhões — tributos unificados no DAS",
  },
  { value: "mei", description: "Faturamento até R$ 81 mil/ano — DAS fixo mensal" },
  {
    value: "lucro_presumido",
    description: "Lucro estimado por presunção — PIS/COFINS cumulativo",
  },
  {
    value: "lucro_real",
    description: "Tributação sobre lucro efetivo — PIS/COFINS não-cumulativo",
  },
];

function RegimeSection() {
  const { currentInvoice, changeRegime } = useInvoiceStore();
  if (!currentInvoice) {
    return null;
  }

  return (
    <section className="card p-5">
      <h2 className="section-title mb-4">Regime Tributário</h2>
      <div className="grid grid-cols-2 gap-3">
        {REGIME_OPTIONS.map((option) => {
          const isActive = currentInvoice.taxRegime === option.value;
          return (
            <label
              key={option.value}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="regime"
                value={option.value}
                checked={isActive}
                onChange={() => changeRegime(option.value)}
                className="mt-0.5 accent-blue-600"
              />
              <div>
                <p
                  className={`text-sm font-semibold ${isActive ? "text-blue-700" : "text-slate-700"}`}
                >
                  {REGIME_LABELS[option.value]}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {option.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}

export { RegimeSection };
