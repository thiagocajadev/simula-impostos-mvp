import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { app } from "electron";
import { buildSeedInvoices } from "./invoice.seed";

function resolveDataPath(): string {
  const path = join(app.getPath("userData"), "notas-fiscais.json");
  return path;
}

function isValidInvoice(item: unknown): boolean {
  if (!item || typeof item !== "object") {
    return false;
  }
  const candidate = item as Record<string, unknown>;

  const hasIdentity = typeof candidate.id === "string" && candidate.number != null;
  if (!hasIdentity) {
    return false;
  }

  const hasParties =
    candidate.recipient !== null &&
    typeof candidate.recipient === "object" &&
    candidate.issuer !== null &&
    typeof candidate.issuer === "object";
  if (!hasParties) {
    return false;
  }

  const hasTaxData =
    typeof candidate.taxRegime === "string" &&
    candidate.taxes !== null &&
    typeof candidate.taxes === "object";
  return hasTaxData;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function migrateParty(party: Record<string, unknown>): Record<string, unknown> {
  const out = { ...party };
  if ("cnpj" in out && !("taxId" in out)) {
    out.taxId = out.cnpj;
    delete out.cnpj;
  }
  if ("ie" in out && !("stateRegistration" in out)) {
    out.stateRegistration = out.ie;
    delete out.ie;
  }
  return out;
}

function migrateInvoice(item: Record<string, unknown>): Record<string, unknown> {
  const out = { ...item };
  if (out.issuer && typeof out.issuer === "object") {
    out.issuer = migrateParty(out.issuer as Record<string, unknown>);
  }
  if (out.recipient && typeof out.recipient === "object") {
    out.recipient = migrateParty(out.recipient as Record<string, unknown>);
  }
  if (Array.isArray(out.items)) {
    out.items = out.items.map((it: Record<string, unknown>) => {
      if (it.type === "produto") return { ...it, type: "product" };
      if (it.type === "servico") return { ...it, type: "service" };
      return it;
    });
  }
  if (out.status === "rascunho") out.status = "draft";
  if (out.status === "emitida") out.status = "issued";
  return out;
}

async function readInvoices(): Promise<unknown[]> {
  const path = resolveDataPath();
  try {
    const content = await readFile(path, "utf-8");
    const all = JSON.parse(content) as unknown[];
    const migrated = all.map((item) => migrateInvoice(item as Record<string, unknown>));
    const valid = migrated.filter(isValidInvoice);
    return valid;
  } catch {
    const empty: unknown[] = [];
    return empty;
  }
}

async function writeInvoices(invoices: unknown[]): Promise<void> {
  const path = resolveDataPath();
  await writeFile(path, JSON.stringify(invoices, null, 2), "utf-8");
}

async function loadOrSeedInvoices(): Promise<unknown[]> {
  const path = resolveDataPath();
  const exists = await fileExists(path);

  if (!exists) {
    const seeded = buildSeedInvoices();
    await writeInvoices(seeded);
    return seeded;
  }

  const invoices = await readInvoices();
  return invoices;
}

export { readInvoices, writeInvoices, loadOrSeedInvoices };
