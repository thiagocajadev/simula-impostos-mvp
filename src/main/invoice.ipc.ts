import { ipcMain } from "electron";
import { loadOrSeedInvoices, readInvoices, writeInvoices } from "./invoice.persist";

function registerInvoiceHandlers(): void {
  ipcMain.handle("invoice:list", () => loadOrSeedInvoices());

  ipcMain.handle("invoice:create", async (_event, invoice: { id: string }) => {
    const invoices = await readInvoices();
    invoices.push(invoice);
    await writeInvoices(invoices);
    return invoice;
  });

  ipcMain.handle("invoice:update", async (_event, invoice: { id: string }) => {
    const invoices = (await readInvoices()) as { id: string }[];
    const index = invoices.findIndex((entry) => entry.id === invoice.id);
    if (index >= 0) {
      invoices[index] = invoice;
    } else {
      invoices.push(invoice);
    }
    await writeInvoices(invoices);
    return invoice;
  });

  ipcMain.handle("invoice:delete", async (_event, id: string) => {
    const invoices = (await readInvoices()) as { id: string }[];
    const remaining = invoices.filter((entry) => entry.id !== id);
    await writeInvoices(remaining);
  });
}

export { registerInvoiceHandlers };
