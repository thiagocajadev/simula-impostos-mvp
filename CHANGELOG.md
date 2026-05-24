# Changelog

## [Unreleased] — 2026-05-24

### Added

- Build scripts (`dist:win`, `dist:linux`, `dist:mac`) agora geram artefatos em subpastas separadas por S.O. (`dist/Windows/`, `dist/Linux/`, `dist/Mac/`); `artifactName` prefixado com `WINDOWS-`, `LINUX-`, `MAC-` em UPPERCASE para facilitar identificação nos assets do GitHub Release.

### Fixed

- Tooltip do ícone de informação (ⓘ) cortado no topo para o primeiro imposto em ambas as seções (Regime Atual e Pós Reforma): primeiro item agora abre o balão abaixo (`top-full`); demais continuam abrindo acima (`bottom-full`).

## [1.0.4] — 2026-05-21

### Added

- Polish & UX sweep across the full app: author renamed to `@thiagocajadev` in package.json/dist config; `@media print` + `@page { size: A4; margin: 0 }` hides toolbar on PDF export and sets correct page size; PDF `marginType: "none"` (content carries its own padding); toolbar now sticky during DANFE scroll (`h-screen` + `flex-1 overflow-auto`); button "Add" renamed to "Adicionar"; DANFE borders standardised to neutral `1px solid #ccc/ddd`; block spacing increased to `marginBottom: 8`; actions column moved to first position in invoice list (⚙ header); duplicate printer icon removed.
- Form grid harmonised: top row (`grid-cols-12`, Natureza `col-span-6`); `PartyFields` address/neighborhood/city/UF rows fill all 12 columns; items form row 2 (UN/Qtd/Vlr/Btn) fills 12 columns; `step="1"` on quantity and unit-price number inputs; placeholders added to all previously empty fields.
- CNPJ/CPF auto-mask with alphanumeric support (IN RFB 2.229/2024, vigência jul/2026): accepts `[A-Z0-9]` in positions 1–12, numeric check-digits in 13–14; Mod-11 algorithm using `charCode − 48`; CPF detected by ≤11 numeric chars; test values (all-same chars) bypass validation; CEP mask; both values displayed formatted on load from store; on-blur validation with red ring + error message.
- Tax totals moved to shared side-by-side footer bar below both accordion sections (Regime Atual orange / Pós Reforma blue), always aligned regardless of item count difference.
- README expanded: `## Download` section with release link and platform table; full siglas table (ICMS, ISS, IPI, PIS, COFINS, IRPJ, CSLL, CBS, IBS, IS) with name, scope, and what each taxes; detailed description of all 4 tax regimes (Simples Nacional, MEI, Lucro Presumido, Lucro Real); EN→PT-BR glossary table (28 code terms mapped to interface labels).

## [Unreleased] — 2026-05-21

### Fixed

- Add `README.md` with project introduction in pt-BR, fundamental concepts table (Reforma Tributária, DANFE, regime tributário, CBS, IBS, IS), tax regime comparison table with default rates, dev/build/release scripts reference, project layout, and distribution instructions.

## [Unreleased] — 2026-05-21

### Fixed

- Refactor `src/main/index.ts` into semantic modules: extract seed data to `invoice.seed.ts`, async persistence layer (read/write/loadOrSeed) to `invoice.persist.ts`, IPC handlers to `invoice.ipc.ts` and `print.ipc.ts`, window factory to `window.ts`; entry point reduced to 21 lines. Rename `getDataFile()` → `resolveDataPath()` (banned verb `get`). Convert sync file I/O (`readFileSync`/`writeFileSync`) to async (`readFile`/`writeFile`). Fix CQS violation in `loadInvoices` by splitting into `readInvoices()` (query) and `loadOrSeedInvoices()` (orchestrator). Move `generateId()` and `nextInvoiceNumber()` from `invoice.format.ts` to `invoice.compute.ts` (SRP); update import in `invoice.store.ts`.

## [Unreleased] — 2026-05-21

### Added

- Add collapsible accordion sections to the NF form: all 7 sections (Regime Tributário, Dados da NF, Itens, Impostos Atual, Impostos Reforma, Resumo, Informações Adicionais) are individually expandable with contextual summary chips in the collapsed header. A single "Expandir todos / Recolher todos" button controls all at once. Regime Tributário is the first section; all start collapsed. Accordion state lives in `InvoiceForm` as a `Record<SectionKey, boolean>`, enabling bulk toggle without `useEffect`. Duplicate action buttons removed from the top toolbar.
- Add zoom control and improved DANFE layout to the print preview. Zoom works via Ctrl+scroll (non-passive wheel listener on the scroll area), [−]/[+] step buttons, and a preset dropdown (50 / 75 / 90 / 100 / 125 / 150%). CSS `zoom` property adjusts layout and scroll area natively in Electron/Chromium. DANFE layout improvements: simulated 44-digit Chave de Acesso displayed in groups of 4 below the header; restructured tax calculation section with full-width horizontal rows for Regime Atual (7 taxes) and Pós Reforma (3 taxes, EC 132/2023), each with a colored total cell; integrated diff comparison widget in the totals block; expanded issuer block with CNPJ, IE, and Regime Tributário.

## [Unreleased] — 2026-05-20

### Fixed

- Fix date off-by-one in `invoice.format.ts`: `new Date("YYYY-MM-DD")` parsed as UTC midnight caused dates to display one day behind in BRT (UTC-3); append `T00:00:00` to force local-time parse.
- Fix CFOP not resetting when item type changes in `items.section.tsx`: switching tipo from "produto" to "servico" now auto-sets CFOP to 5933 (ISS); switching back sets 5102. Prevents mismatched CFOP/type on item entry.

- Rename all source files to `domain.operation.ext` pattern (EN): `invoice.format.ts`, `tax.calculate.ts`, `invoice.store.ts`, `invoice.types.ts`, `app.layout.tsx`, `invoice.list.tsx`, `invoice.print.tsx`, `components/invoice.form/` with 6 section files. Rename components and store hook to English (`InvoiceForm`, `InvoiceList`, `InvoicePrint`, `useInvoiceStore`, `CurrentTaxesSection`, `ReformTaxesSection`, `TotalsSection`). Rename IPC channels `nf:*` → `invoice:*` and API property `window.api.nf` → `window.api.invoice`. Fix Portuguese variable names (`loadInvoices`, `saveInvoices`, `invoices`, `fileName`). Fix unbraced guards in `main/index.ts`. Replace banned abbreviations (`idx→index`, single-letter callback vars → semantic names). Apply Explaining Returns to all return-with-logic expressions. Apply Revealing Module Pattern (footer exports) to utility and store modules. Migrate `import React` to named `import { useState }`. 0 biome errors, 0 TS errors.

## [1.0.0] — 2026-05-20

### Fixed

- Configure `.editorconfig` and `biome.json` from pre-built tooling templates; add `@biomejs/biome@2.0.6` devDependency and `lint:biome` / `lint:biome:fix` scripts; apply all resulting lint corrections across `src/` — `node:` import protocol, `a11y/useButtonType`, `a11y/noLabelWithoutControl`, `useTemplate` — reaching 0 errors on 20 files.
