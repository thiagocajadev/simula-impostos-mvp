import { create } from "zustand";
import type { Invoice, InvoiceItem, TaxItem, TaxRegime } from "../types";
import { generateId, nextInvoiceNumber } from "../utils/formatters";
import {
  createDefaultCurrentTaxes,
  createDefaultReformTaxes,
  recalcCurrentTaxes,
  recalcReformTaxes,
  sumCurrentTaxes,
  sumReformTaxes,
} from "../utils/taxCalculator";

export type Page = "list" | "form" | "print";

function defaultIssuer() {
  return {
    companyName: "Minha Empresa Ltda",
    cnpj: "00000000000191",
    ie: "123456789",
    zipCode: "01310100",
    address: "Av. Paulista",
    number: "1000",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
  };
}

function emptyInvoice(invoices: Invoice[]): Invoice {
  const regime: TaxRegime = "lucro_presumido";
  const now = new Date().toISOString();
  return {
    id: generateId(),
    number: nextInvoiceNumber(invoices),
    series: "001",
    issueDate: now.slice(0, 10),
    operationNature: "Venda de mercadoria",
    issuer: defaultIssuer(),
    recipient: {
      companyName: "",
      cnpj: "",
      ie: "",
      zipCode: "",
      address: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
    },
    items: [],
    taxRegime: regime,
    taxes: {
      current: createDefaultCurrentTaxes(regime),
      reform: createDefaultReformTaxes(),
    },
    totalProducts: 0,
    totalServices: 0,
    totalCurrentTaxes: 0,
    totalReformTaxes: 0,
    totalInvoice: 0,
    additionalInfo: "",
    status: "rascunho",
    createdAt: now,
    updatedAt: now,
  };
}

function recalcTotals(invoice: Invoice): Invoice {
  const current = recalcCurrentTaxes(invoice.items, invoice.taxes.current);
  const reform = recalcReformTaxes(invoice.items, invoice.taxes.reform);
  const totalProducts = invoice.items
    .filter((i) => i.type === "produto")
    .reduce((sum, i) => sum + i.totalPrice, 0);
  const totalServices = invoice.items
    .filter((i) => i.type === "servico")
    .reduce((sum, i) => sum + i.totalPrice, 0);
  const totalCurrentTaxes = sumCurrentTaxes(current);
  const totalReformTaxes = sumReformTaxes(reform);
  return {
    ...invoice,
    taxes: { current, reform },
    totalProducts,
    totalServices,
    totalCurrentTaxes,
    totalReformTaxes,
    totalInvoice: totalProducts + totalServices + totalCurrentTaxes,
  };
}

interface InvoiceStore {
  page: Page;
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  isLoading: boolean;

  setPage: (page: Page) => void;
  loadInvoices: () => Promise<void>;
  newInvoice: () => void;
  editInvoice: (invoice: Invoice) => void;
  printInvoice: (invoice: Invoice) => void;
  saveInvoice: (status: "rascunho" | "emitida") => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;

  setIssuer: (field: string, value: string) => void;
  setRecipient: (field: string, value: string) => void;
  setField: (field: keyof Invoice, value: unknown) => void;
  changeRegime: (regime: TaxRegime) => void;

  addItem: (item: Omit<InvoiceItem, "id" | "totalPrice">) => void;
  updateItem: (id: string, fields: Partial<InvoiceItem>) => void;
  removeItem: (id: string) => void;

  toggleTax: (section: "current" | "reform", key: string) => void;
  setTaxRate: (section: "current" | "reform", key: string, rate: number) => void;
}

export const useNFStore = create<InvoiceStore>((set, get) => ({
  page: "list",
  invoices: [],
  currentInvoice: null,
  isLoading: false,

  setPage: (page) => set({ page }),

  loadInvoices: async () => {
    set({ isLoading: true });
    const invoices = (await window.api.nf.list()) as Invoice[];
    set({ invoices, isLoading: false });
  },

  newInvoice: () => {
    const invoice = emptyInvoice(get().invoices);
    set({ currentInvoice: invoice, page: "form" });
  },

  editInvoice: (invoice) => set({ currentInvoice: { ...invoice }, page: "form" }),

  printInvoice: (invoice) => set({ currentInvoice: { ...invoice }, page: "print" }),

  saveInvoice: async (status) => {
    const invoice = get().currentInvoice;
    if (!invoice) {
      return;
    }
    const updated = recalcTotals({ ...invoice, status, updatedAt: new Date().toISOString() });
    const exists = get().invoices.some((inv) => inv.id === updated.id);
    if (exists) {
      await window.api.nf.update(updated);
    } else {
      await window.api.nf.create(updated);
    }
    await get().loadInvoices();
    set({ currentInvoice: updated, page: status === "emitida" ? "print" : "list" });
  },

  deleteInvoice: async (id) => {
    await window.api.nf.delete(id);
    await get().loadInvoices();
  },

  setIssuer: (field, value) =>
    set((state) =>
      state.currentInvoice
        ? {
            currentInvoice: {
              ...state.currentInvoice,
              issuer: { ...state.currentInvoice.issuer, [field]: value },
            },
          }
        : state,
    ),

  setRecipient: (field, value) =>
    set((state) =>
      state.currentInvoice
        ? {
            currentInvoice: {
              ...state.currentInvoice,
              recipient: { ...state.currentInvoice.recipient, [field]: value },
            },
          }
        : state,
    ),

  setField: (field, value) =>
    set((state) =>
      state.currentInvoice
        ? { currentInvoice: { ...state.currentInvoice, [field]: value } }
        : state,
    ),

  changeRegime: (regime) =>
    set((state) => {
      if (!state.currentInvoice) {
        return state;
      }
      const updated = recalcTotals({
        ...state.currentInvoice,
        taxRegime: regime,
        taxes: {
          ...state.currentInvoice.taxes,
          current: createDefaultCurrentTaxes(regime),
        },
      });
      return { currentInvoice: updated };
    }),

  addItem: (item) =>
    set((state) => {
      if (!state.currentInvoice) {
        return state;
      }
      const totalPrice = +(item.quantity * item.unitPrice).toFixed(2);
      const newItem: InvoiceItem = { ...item, id: generateId(), totalPrice };
      const updated = recalcTotals({
        ...state.currentInvoice,
        items: [...state.currentInvoice.items, newItem],
      });
      return { currentInvoice: updated };
    }),

  updateItem: (id, fields) =>
    set((state) => {
      if (!state.currentInvoice) {
        return state;
      }
      const items = state.currentInvoice.items.map((item) => {
        if (item.id !== id) {
          return item;
        }
        const updated = { ...item, ...fields };
        updated.totalPrice = +(updated.quantity * updated.unitPrice).toFixed(2);
        return updated;
      });
      return { currentInvoice: recalcTotals({ ...state.currentInvoice, items }) };
    }),

  removeItem: (id) =>
    set((state) => {
      if (!state.currentInvoice) {
        return state;
      }
      const items = state.currentInvoice.items.filter((i) => i.id !== id);
      return { currentInvoice: recalcTotals({ ...state.currentInvoice, items }) };
    }),

  toggleTax: (section, key) =>
    set((state) => {
      if (!state.currentInvoice) {
        return state;
      }
      const block = state.currentInvoice.taxes[section] as unknown as Record<string, TaxItem>;
      const current = block[key];
      const updated = { ...block, [key]: { ...current, enabled: !current.enabled } };
      const invoice = recalcTotals({
        ...state.currentInvoice,
        taxes: { ...state.currentInvoice.taxes, [section]: updated },
      });
      return { currentInvoice: invoice };
    }),

  setTaxRate: (section, key, rate) =>
    set((state) => {
      if (!state.currentInvoice) {
        return state;
      }
      const block = state.currentInvoice.taxes[section] as unknown as Record<string, TaxItem>;
      const updated = { ...block, [key]: { ...block[key], rate } };
      const invoice = recalcTotals({
        ...state.currentInvoice,
        taxes: { ...state.currentInvoice.taxes, [section]: updated },
      });
      return { currentInvoice: invoice };
    }),
}));
