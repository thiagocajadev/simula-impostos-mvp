const format = {
  currency: (value: number): string =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value),

  percent: (value: number): string =>
    `${new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value)}%`,

  cnpj: (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    const formatted = digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    return formatted;
  },

  zipCode: (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    const formatted = digits.replace(/^(\d{5})(\d{3})$/, "$1-$2");
    return formatted;
  },

  date: (iso: string): string => new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR"),

  invoiceNumber: (number: string): string => number.padStart(9, "0"),
};

const REGIME_LABELS: Record<string, string> = {
  simples_nacional: "Simples Nacional",
  mei: "MEI",
  lucro_presumido: "Lucro Presumido",
  lucro_real: "Lucro Real",
};

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  emitida: "Emitida",
};

function generateId(): string {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  return id;
}

function nextInvoiceNumber(invoices: { number: string }[]): string {
  const maximum = invoices.reduce(
    (max, invoice) => Math.max(max, Number.parseInt(invoice.number, 10) || 0),
    0,
  );
  const next = String(maximum + 1);
  return next;
}

export { format, REGIME_LABELS, STATUS_LABELS, generateId, nextInvoiceNumber };
