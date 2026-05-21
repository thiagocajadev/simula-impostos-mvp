import { app, BrowserWindow } from "electron";
import { registerInvoiceHandlers } from "./invoice.ipc";
import { registerPrintHandlers } from "./print.ipc";
import { createWindow } from "./window";

registerInvoiceHandlers();
registerPrintHandlers();

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
