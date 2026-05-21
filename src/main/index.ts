import { app, BrowserWindow } from "electron";
import { registerInvoiceHandlers } from "./invoice.ipc";
import { registerPrintHandlers } from "./print.ipc";
import { createTray } from "./tray";
import { createWindow } from "./window";

registerInvoiceHandlers();
registerPrintHandlers();

app.whenReady().then(() => {
  const mainWindow = createWindow();
  createTray(mainWindow);
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
