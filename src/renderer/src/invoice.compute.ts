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

export { generateId, nextInvoiceNumber };
