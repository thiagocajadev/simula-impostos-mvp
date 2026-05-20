import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";

const getDataFile = (): string => join(app.getPath("userData"), "notas-fiscais.json");

function loadInvoices(): unknown[] {
  const file = getDataFile();
  if (!existsSync(file)) {
    return [];
  }
  try {
    return JSON.parse(readFileSync(file, "utf-8"));
  } catch {
    return [];
  }
}

function saveInvoices(invoices: unknown[]): void {
  writeFileSync(getDataFile(), JSON.stringify(invoices, null, 2), "utf-8");
}

ipcMain.handle("invoice:list", () => loadInvoices());

ipcMain.handle("invoice:create", (_event, invoice: { id: string }) => {
  const invoices = loadInvoices();
  invoices.push(invoice);
  saveInvoices(invoices);
  return invoice;
});

ipcMain.handle("invoice:update", (_event, invoice: { id: string }) => {
  const invoices = loadInvoices() as { id: string }[];
  const index = invoices.findIndex((entry) => entry.id === invoice.id);
  if (index >= 0) {
    invoices[index] = invoice;
  } else {
    invoices.push(invoice);
  }
  saveInvoices(invoices);
  return invoice;
});

ipcMain.handle("invoice:delete", (_event, id: string) => {
  const invoices = (loadInvoices() as { id: string }[]).filter((entry) => entry.id !== id);
  saveInvoices(invoices);
});

ipcMain.handle("print:toPDF", async (event, fileName: string) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) {
    return { success: false, error: "Janela não encontrada" };
  }

  try {
    const pdfData = await win.webContents.printToPDF({
      printBackground: true,
      pageSize: "A4",
      margins: { marginType: "printableArea" },
    });

    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: "Salvar NF-e como PDF",
      defaultPath: `${fileName}.pdf`,
      filters: [{ name: "Documento PDF", extensions: ["pdf"] }],
    });

    if (canceled || !filePath) {
      return { success: false };
    }

    writeFileSync(filePath, pdfData);
    return { success: true, filePath };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: "default",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
