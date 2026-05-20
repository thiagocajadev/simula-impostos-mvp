# Changelog

## [Unreleased] — 2026-05-20

### Fixed

- Rename all source files to `domain.operation.ext` pattern (EN): `invoice.format.ts`, `tax.calculate.ts`, `invoice.store.ts`, `invoice.types.ts`, `app.layout.tsx`, `invoice.list.tsx`, `invoice.print.tsx`, `components/invoice.form/` with 6 section files. Rename components and store hook to English (`InvoiceForm`, `InvoiceList`, `InvoicePrint`, `useInvoiceStore`, `CurrentTaxesSection`, `ReformTaxesSection`, `TotalsSection`). Rename IPC channels `nf:*` → `invoice:*` and API property `window.api.nf` → `window.api.invoice`. Fix Portuguese variable names (`loadInvoices`, `saveInvoices`, `invoices`, `fileName`). Fix unbraced guards in `main/index.ts`. Replace banned abbreviations (`idx→index`, single-letter callback vars → semantic names). Apply Explaining Returns to all return-with-logic expressions. Apply Revealing Module Pattern (footer exports) to utility and store modules. Migrate `import React` to named `import { useState }`. 0 biome errors, 0 TS errors.

## [1.0.0] — 2026-05-20

### Fixed

- Configure `.editorconfig` and `biome.json` from pre-built tooling templates; add `@biomejs/biome@2.0.6` devDependency and `lint:biome` / `lint:biome:fix` scripts; apply all resulting lint corrections across `src/` — `node:` import protocol, `a11y/useButtonType`, `a11y/noLabelWithoutControl`, `useTemplate` — reaching 0 errors on 20 files.
