import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useNFStore } from "../../store/useNFStore";
import { fmt } from "../../utils/formatters";

export function TotaisSection() {
  const { currentInvoice } = useNFStore();
  if (!currentInvoice) {
    return null;
  }

  const subtotal = currentInvoice.totalProducts + currentInvoice.totalServices;
  const currentTaxTotal = currentInvoice.totalCurrentTaxes;
  const reformTaxTotal = currentInvoice.totalReformTaxes;
  const diff = reformTaxTotal - currentTaxTotal;
  const diffPercent = currentTaxTotal > 0 ? (diff / currentTaxTotal) * 100 : 0;

  const DiffIcon = diff < 0 ? TrendingDown : diff > 0 ? TrendingUp : Minus;
  const diffColor = diff < 0 ? "text-emerald-600" : diff > 0 ? "text-red-500" : "text-slate-500";

  return (
    <section className="card p-5">
      <h2 className="section-title mb-4">Resumo e Comparativo</h2>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs text-slate-500 font-medium mb-1">Subtotal (produtos + serviços)</p>
          <p className="text-xl font-bold text-slate-800">{fmt.currency(subtotal)}</p>
          <div className="flex gap-3 mt-2 text-xs text-slate-500">
            <span>Produtos: {fmt.currency(currentInvoice.totalProducts)}</span>
            <span>Serviços: {fmt.currency(currentInvoice.totalServices)}</span>
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <p className="text-xs text-orange-600 font-medium mb-1">Impostos — Regime Atual</p>
          <p className="text-xl font-bold text-orange-700">{fmt.currency(currentTaxTotal)}</p>
          {subtotal > 0 && (
            <p className="text-xs text-orange-500 mt-2">
              {fmt.percent((currentTaxTotal / subtotal) * 100)} sobre subtotal
            </p>
          )}
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-xs text-blue-600 font-medium mb-1">Impostos — Pós Reforma</p>
          <p className="text-xl font-bold text-blue-700">{fmt.currency(reformTaxTotal)}</p>
          {subtotal > 0 && (
            <p className="text-xs text-blue-500 mt-2">
              {fmt.percent((reformTaxTotal / subtotal) * 100)} sobre subtotal
            </p>
          )}
        </div>
      </div>

      {subtotal > 0 && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center gap-4">
          <DiffIcon size={28} className={diffColor} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700">
              {diff === 0
                ? "Carga tributária equivalente nos dois regimes"
                : diff < 0
                  ? `A reforma reduz a carga tributária em ${fmt.currency(Math.abs(diff))}`
                  : `A reforma aumenta a carga tributária em ${fmt.currency(Math.abs(diff))}`}
            </p>
            {diff !== 0 && (
              <p className={`text-xs mt-0.5 ${diffColor}`}>
                {Math.abs(diffPercent).toFixed(1)}% {diff < 0 ? "menor" : "maior"} que o regime
                atual
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-0.5">Diferença</p>
            <p className={`text-lg font-bold ${diffColor}`}>
              {diff > 0 ? "+" : ""}
              {fmt.currency(diff)}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t-2 border-slate-300 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Total da Nota Fiscal</p>
          <p className="text-xs text-slate-400">(subtotal + impostos regime atual)</p>
        </div>
        <p className="text-2xl font-bold text-slate-800">
          {fmt.currency(currentInvoice.totalInvoice)}
        </p>
      </div>
    </section>
  );
}
