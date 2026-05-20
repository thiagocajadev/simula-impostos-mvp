export const fmt = {
  currency: (value: number): string =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value),

  percent: (value: number): string =>
    `${new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value)}%`,

  cnpj: (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  },

  zipCode: (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    return digits.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  },

  date: (iso: string): string => new Date(iso).toLocaleDateString("pt-BR"),

  invoiceNumber: (number: string): string => number.padStart(9, "0"),
};

export const REGIME_LABELS: Record<string, string> = {
  simples_nacional: "Simples Nacional",
  mei: "MEI",
  lucro_presumido: "Lucro Presumido",
  lucro_real: "Lucro Real",
};

export const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  emitida: "Emitida",
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function nextInvoiceNumber(invoices: { number: string }[]): string {
  const max = invoices.reduce((m, inv) => Math.max(m, Number.parseInt(inv.number, 10) || 0), 0);
  return String(max + 1);
}
