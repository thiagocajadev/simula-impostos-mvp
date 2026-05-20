import { Package, Plus, Trash2, Wrench } from "lucide-react";
import { useState } from "react";
import { format } from "../../invoice.format";
import { useInvoiceStore } from "../../invoice.store";
import type { OperationType } from "../../invoice.types";

const CFOP_OPTIONS = [
  { value: "5101", label: "5101 — Venda de produção do estabelecimento" },
  { value: "5102", label: "5102 — Venda de mercadoria adquirida de terceiro" },
  { value: "5301", label: "5301 — Prestação de serviço com ICMS" },
  { value: "5933", label: "5933 — Prestação de serviço tributada pelo ISS" },
];

type ItemForm = {
  description: string;
  ncm: string;
  cfop: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  type: OperationType;
};

const EMPTY_FORM: ItemForm = {
  description: "",
  ncm: "",
  cfop: "5102",
  unit: "UN",
  quantity: "1",
  unitPrice: "",
  type: "produto",
};

const DEFAULT_CFOP_BY_TYPE: Record<OperationType, string> = {
  produto: "5102",
  servico: "5933",
};

function ItemsSection() {
  const { currentInvoice, addItem, removeItem } = useInvoiceStore();
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM);

  if (!currentInvoice) {
    return null;
  }

  const setFormField = (field: keyof ItemForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const selectItemType = (itemType: OperationType) =>
    setForm((prev) => ({ ...prev, type: itemType, cfop: DEFAULT_CFOP_BY_TYPE[itemType] }));

  const submitItem = () => {
    const quantity = Number.parseFloat(form.quantity) || 0;
    const unitPrice = Number.parseFloat(form.unitPrice.replace(",", ".")) || 0;
    if (!form.description || quantity <= 0 || unitPrice <= 0) {
      return;
    }
    addItem({
      description: form.description,
      ncm: form.ncm,
      cfop: form.cfop,
      unit: form.unit,
      quantity,
      unitPrice,
      type: form.type,
    });
    setForm(EMPTY_FORM);
  };

  return (
    <section className="card p-5">
      <h2 className="section-title mb-4">Itens da Nota</h2>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
        <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">
          Adicionar item
        </p>
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-2">
            <label htmlFor="item-type" className="label">
              Tipo
            </label>
            <select
              id="item-type"
              value={form.type}
              onChange={(e) => selectItemType(e.target.value as OperationType)}
              className="input"
            >
              <option value="produto">Produto</option>
              <option value="servico">Serviço</option>
            </select>
          </div>

          <div className="col-span-4">
            <label htmlFor="item-description" className="label">
              Descrição *
            </label>
            <input
              id="item-description"
              type="text"
              value={form.description}
              onChange={(e) => setFormField("description", e.target.value)}
              placeholder="Nome do produto ou serviço"
              className="input"
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="item-ncm" className="label">
              NCM
            </label>
            <input
              id="item-ncm"
              type="text"
              value={form.ncm}
              onChange={(e) => setFormField("ncm", e.target.value)}
              placeholder="0000.00.00"
              maxLength={10}
              className="input"
            />
          </div>

          <div className="col-span-4">
            <label htmlFor="item-cfop" className="label">
              CFOP
            </label>
            <select
              id="item-cfop"
              value={form.cfop}
              onChange={(e) => setFormField("cfop", e.target.value)}
              className="input"
            >
              {CFOP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label htmlFor="item-unit" className="label">
              UN
            </label>
            <input
              id="item-unit"
              type="text"
              value={form.unit}
              onChange={(e) => setFormField("unit", e.target.value)}
              className="input"
              maxLength={4}
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="item-quantity" className="label">
              Quantidade *
            </label>
            <input
              id="item-quantity"
              type="number"
              min="0"
              step="0.001"
              value={form.quantity}
              onChange={(e) => setFormField("quantity", e.target.value)}
              className="input"
            />
          </div>

          <div className="col-span-3">
            <label htmlFor="item-unitPrice" className="label">
              Valor Unitário *
            </label>
            <input
              id="item-unitPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.unitPrice}
              onChange={(e) => setFormField("unitPrice", e.target.value)}
              placeholder="0,00"
              className="input"
            />
          </div>

          <div className="col-span-2 flex items-end">
            <button
              type="button"
              onClick={submitItem}
              className="btn-primary w-full justify-center"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>
      </div>

      {currentInvoice.items.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Package size={28} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum item adicionado</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-slate-200">
              <th className="pb-2 text-xs text-slate-500 font-semibold uppercase">Tipo</th>
              <th className="pb-2 text-xs text-slate-500 font-semibold uppercase">Descrição</th>
              <th className="pb-2 text-xs text-slate-500 font-semibold uppercase">NCM</th>
              <th className="pb-2 text-xs text-slate-500 font-semibold uppercase">CFOP</th>
              <th className="pb-2 text-xs text-slate-500 font-semibold uppercase text-right">
                Qtd
              </th>
              <th className="pb-2 text-xs text-slate-500 font-semibold uppercase text-right">
                Vl. Unit
              </th>
              <th className="pb-2 text-xs text-slate-500 font-semibold uppercase text-right">
                Total
              </th>
              <th className="pb-2 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentInvoice.items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="py-2.5 pr-3">
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.type === "produto"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {item.type === "produto" ? <Package size={10} /> : <Wrench size={10} />}
                    {item.type === "produto" ? "Prod" : "Serv"}
                  </span>
                </td>
                <td className="py-2.5 text-slate-800 font-medium">{item.description}</td>
                <td className="py-2.5 text-slate-500 font-mono text-xs">{item.ncm || "—"}</td>
                <td className="py-2.5 text-slate-500 font-mono text-xs">{item.cfop}</td>
                <td className="py-2.5 text-right text-slate-600">
                  {item.quantity} {item.unit}
                </td>
                <td className="py-2.5 text-right text-slate-600">
                  {format.currency(item.unitPrice)}
                </td>
                <td className="py-2.5 text-right font-semibold text-slate-800">
                  {format.currency(item.totalPrice)}
                </td>
                <td className="py-2.5 pl-2">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200">
              <td colSpan={6} className="pt-2 text-xs font-semibold text-slate-500 text-right pr-4">
                SUBTOTAL
              </td>
              <td className="pt-2 text-right font-bold text-slate-800">
                {format.currency(currentInvoice.totalProducts + currentInvoice.totalServices)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      )}
    </section>
  );
}

export { ItemsSection };
