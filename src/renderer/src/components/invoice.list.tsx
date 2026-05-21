import { Edit2, Eye, FileText, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { format, REGIME_LABELS, STATUS_LABELS } from "../invoice.format";
import { useInvoiceStore } from "../invoice.store";
import type { Invoice } from "../invoice.types";

function InvoiceList() {
  const {
    invoices,
    isLoading,
    loadInvoices,
    newInvoice,
    editInvoice,
    printInvoice,
    deleteInvoice,
  } = useInvoiceStore();

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const confirmDelete = (invoice: Invoice) => {
    if (window.confirm(`Excluir NF ${format.invoiceNumber(invoice.number)}?`)) {
      deleteInvoice(invoice.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notas Fiscais</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {invoices.length} {invoices.length === 1 ? "nota" : "notas"} no sistema
          </p>
        </div>
        <button type="button" onClick={newInvoice} className="btn-primary">
          <Plus size={15} />
          Nova NF
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <FileText size={24} className="text-slate-400" />
          </div>
          <h3 className="text-slate-700 font-semibold mb-1">Nenhuma nota fiscal</h3>
          <p className="text-slate-400 text-sm mb-5">Comece emitindo sua primeira NF simulada</p>
          <button type="button" onClick={newInvoice} className="btn-primary">
            <Plus size={15} />
            Nova Nota Fiscal
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wide">
                  ⚙
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                  Número
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                  Data
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                  Destinatário
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                  Regime
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                  Total NF
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                  Imp. Atual
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                  Imp. Reforma
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-center">
                      {invoice.status === "draft" && (
                        <button
                          type="button"
                          onClick={() => editInvoice(invoice)}
                          title="Editar"
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => printInvoice(invoice)}
                        title="Visualizar Cálculo de Imposto"
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDelete(invoice)}
                        title="Excluir"
                        className="p-1.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-blue-600">
                    {format.invoiceNumber(invoice.number)}-{invoice.series}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{format.date(invoice.issueDate)}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium">
                    {invoice.recipient?.companyName || (
                      <span className="text-slate-400 italic">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{REGIME_LABELS[invoice.taxRegime]}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">
                    {format.currency(invoice.totalInvoice)}
                  </td>
                  <td className="px-4 py-3 text-right text-orange-600 font-medium">
                    {format.currency(invoice.totalCurrentTaxes)}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-600 font-medium">
                    {format.currency(invoice.totalReformTaxes)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={invoice.status === "issued" ? "badge-emitida" : "badge-rascunho"}
                    >
                      {STATUS_LABELS[invoice.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export { InvoiceList };
