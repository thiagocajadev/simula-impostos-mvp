import { create } from "zustand";
import { generateId, nextInvoiceNumber } from "./invoice.compute";
import type { Invoice, InvoiceItem, TaxItem, TaxRegime } from "./invoice.types";
import {
  createDefaultCurrentTaxes,
  createDefaultReformTaxes,
  recalcCurrentTaxes,
  recalcReformTaxes,
  sumCurrentTaxes,
  sumReformTaxes,
} from "./tax.calculate";

type Page = "list" | "form" | "print";

function defaultIssuer() {
  const issuer = {
    companyName: "Minha Empresa Ltda",
    taxId: "00000000000191",
    stateRegistration: "123456789",
    zipCode: "01310100",
    address: "Av. Paulista",
    number: "1000",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
  };
  return issuer;
}

function emptyInvoice(invoices: Invoice[]): Invoice {
  const regime: TaxRegime = "simples_nacional";
  const now = new Date().toISOString();
  const invoice: Invoice = {
    id: generateId(),
    number: nextInvoiceNumber(invoices),
    series: "001",
    issueDate: now.slice(0, 10),
    operationNature: "",
    issuer: defaultIssuer(),
    recipient: {
      companyName: "",
      taxId: "",
      stateRegistration: "",
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
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
  return recalcTotals(invoice);
}

function recalcTotals(invoice: Invoice): Invoice {
  const current = recalcCurrentTaxes(invoice.items, invoice.taxes.current);
  const reform = recalcReformTaxes(invoice.items, invoice.taxes.reform);
  const totalProducts = invoice.items
    .filter((item) => item.type === "product")
    .reduce((sum, item) => sum + item.totalPrice, 0);
  const totalServices = invoice.items
    .filter((item) => item.type === "service")
    .reduce((sum, item) => sum + item.totalPrice, 0);
  const totalCurrentTaxes = sumCurrentTaxes(current);
  const totalReformTaxes = sumReformTaxes(reform);
  const result: Invoice = {
    ...invoice,
    taxes: { current, reform },
    totalProducts,
    totalServices,
    totalCurrentTaxes,
    totalReformTaxes,
    totalInvoice: totalProducts + totalServices + totalCurrentTaxes,
  };
  return result;
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
  saveInvoice: (status: "draft" | "issued") => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;

  fillDemo: () => void;
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

const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  page: "list",
  invoices: [],
  currentInvoice: null,
  isLoading: false,

  setPage: (page) => set({ page }),

  loadInvoices: async () => {
    set({ isLoading: true });
    const invoices = (await window.api.invoice.list()) as Invoice[];
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
    const exists = get().invoices.some((entry) => entry.id === updated.id);
    if (exists) {
      await window.api.invoice.update(updated);
    } else {
      await window.api.invoice.create(updated);
    }
    await get().loadInvoices();
    set({ currentInvoice: updated, page: status === "issued" ? "print" : "list" });
  },

  deleteInvoice: async (id) => {
    await window.api.invoice.delete(id);
    await get().loadInvoices();
  },

  fillDemo: () =>
    set((state) => {
      if (!state.currentInvoice) return state;
      const demoItems: InvoiceItem[] = [
        {
          id: generateId(),
          description: 'Notebook Dell Inspiron 15"',
          ncm: "84713012",
          cfop: "5102",
          unit: "UN",
          quantity: 5,
          unitPrice: 3500.0,
          totalPrice: 17500.0,
          type: "product",
        },
        {
          id: generateId(),
          description: "Mouse Óptico sem Fio Logitech MX Master 3",
          ncm: "84716054",
          cfop: "5102",
          unit: "UN",
          quantity: 10,
          unitPrice: 250.0,
          totalPrice: 2500.0,
          type: "product",
        },
        {
          id: generateId(),
          description: "Contrato de Suporte Técnico Mensal",
          ncm: "",
          cfop: "5933",
          unit: "MÊS",
          quantity: 1,
          unitPrice: 2000.0,
          totalPrice: 2000.0,
          type: "service",
        },
      ];
      const updated = recalcTotals({
        ...state.currentInvoice,
        operationNature: "Venda de produtos de informática e prestação de serviços",
        recipient: {
          companyName: "Tech Solutions Comércio e Serviços Ltda",
          taxId: "11222333000181",
          stateRegistration: "987654321",
          zipCode: "04571010",
          address: "Av. das Nações Unidas",
          number: "12901",
          neighborhood: "Brooklin Paulista",
          city: "São Paulo",
          state: "SP",
        },
        items: demoItems,
        additionalInfo:
          "NF de demonstração — dados fictícios para fins educativos. Cálculos estimados com alíquotas da Reforma Tributária (EC 132/2023).",
      });
      return { currentInvoice: updated };
    }),

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
      const items = state.currentInvoice.items.filter((item) => item.id !== id);
      return { currentInvoice: recalcTotals({ ...state.currentInvoice, items }) };
    }),

  toggleTax: (section, key) =>
    set((state) => {
      if (!state.currentInvoice) {
        return state;
      }
      const block = state.currentInvoice.taxes[section] as unknown as Record<string, TaxItem>;
      const existing = block[key];
      const updated = { ...block, [key]: { ...existing, enabled: !existing.enabled } };
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

export type { Page };
export { useInvoiceStore };
