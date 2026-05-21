<p align="center">
  <img src="resources/icons/512x512.png" width="360" alt="Simula Impostos" />
</p>

<p align="center">
  <a href="https://github.com/thiagocajaiba/simula-impostos-mvp/releases/latest">
    <img src="https://img.shields.io/github/v/release/thiagocajaiba/simula-impostos-mvp?label=release&color=brightgreen" alt="GitHub release" />
  </a>
  <img src="https://img.shields.io/badge/Electron-34-47848F?logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

<h1 align="center">Simula Impostos</h1>

<p align="center">
  Calcule e compare encargos tributários brasileiros lado a lado:<br/>
  regime atual versus Reforma Tributária (EC 132/2023).
</p>

---

O contador ou empresário preenche uma nota fiscal, seleciona o regime tributário e vê os totais sob os dois conjuntos de regras ao mesmo tempo, com um preview estilo DANFE pronto para impressão.

## Conceitos fundamentais

| Conceito                                                 | O que é                                                                                                                                                           |
| :------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reforma Tributária**                                   | Emenda constitucional EC 132/2023 que substitui ICMS, ISS, IPI, PIS e COFINS por três novos tributos: CBS, IBS e IS. A transição ocorre entre 2026 e 2033.        |
| **DANFE** (Documento Auxiliar da Nota Fiscal Eletrônica) | Documento impresso que acompanha a NF-e no transporte e na entrega. O app gera um preview estilo DANFE com controles de zoom e comparação tributária lado a lado. |
| **Regime tributário**                                    | Classificação legal da empresa que define quais impostos incidem e em quais alíquotas. O app suporta quatro: Simples Nacional, MEI, Lucro Presumido e Lucro Real. |
| **CBS** (Contribuição sobre Bens e Serviços)             | Contribuição federal criada pela reforma para substituir PIS e COFINS. Alíquota padrão na simulação: 8,8%.                                                        |
| **IBS** (Imposto sobre Bens e Serviços)                  | Imposto estadual e municipal criado pela reforma para substituir ICMS e ISS. Alíquota padrão na simulação: 17,7%.                                                 |
| **IS** (Imposto Seletivo)                                | Tributo sobre bens e serviços considerados prejudiciais, como tabaco e bebidas alcoólicas. Alíquota padrão na simulação: 0%.                                      |

## Regimes tributários cobertos

Os impostos do sistema atual variam por regime. Simples Nacional e MEI recolhem tributos por uma única guia DAS (Documento de Arrecadação do Simples Nacional); as alíquotas individuais não aparecem separadas.

| Regime           |   ICMS    |    ISS    |    IPI    |    PIS    |  COFINS   |   IRPJ    |   CSLL    |
| :--------------- | :-------: | :-------: | :-------: | :-------: | :-------: | :-------: | :-------: |
| Simples Nacional | unificado | unificado | unificado | unificado | unificado | unificado | unificado |
| MEI              | unificado | unificado | unificado | unificado | unificado | unificado | unificado |
| Lucro Presumido  |    18%    |    5%     |    10%    |   0,65%   |    3%     |   4,8%    |   2,88%   |
| Lucro Real       |    18%    |    5%     |    10%    |   1,65%   |   7,6%    |    15%    |    9%     |

As alíquotas da reforma (CBS 8,8%, IBS 17,7%, IS 0%) se aplicam uniformemente nos quatro regimes.

## Como começar

**Pré-requisitos**

- Node.js 20 ou superior
- npm 10 ou superior

**Rodar em modo desenvolvimento**

```bash
npm install
npm run dev
```

O Electron abre uma janela com hot reload via Vite.

## Scripts disponíveis

| Script                   | O que faz                                    |
| :----------------------- | :------------------------------------------- |
| `npm run dev`            | Inicia o Electron com hot reload do Vite     |
| `npm run build`          | Compila renderer e main process para `out/`  |
| `npm run start`          | Abre o build compilado sem recompilar        |
| `npm run dist`           | Empacota para a plataforma atual             |
| `npm run dist:win`       | Gera instalador Windows (NSIS)               |
| `npm run dist:linux`     | Gera pacotes AppImage e `.deb`               |
| `npm run typecheck`      | Roda `tsc --noEmit` nos dois tsconfig        |
| `npm run lint:biome`     | Verifica o código com Biome                  |
| `npm run lint:biome:fix` | Verifica e corrige automaticamente com Biome |
| `npm run release`        | Incrementa patch, commit, tag e push         |
| `npm run release:minor`  | O mesmo para incremento de minor             |
| `npm run release:major`  | O mesmo para incremento de major             |

## Estrutura do projeto

```
src/
  main/               # Electron main process
    index.ts            Ponto de entrada e ciclo de vida do app
    window.ts           Configuração do BrowserWindow
    invoice.ipc.ts      Handlers IPC para operações de nota fiscal
    invoice.persist.ts  I/O assíncrono para persistência de notas
    invoice.seed.ts     Fábrica de nota fiscal padrão
    print.ipc.ts        Handler IPC para impressão e exportação PDF
  preload/            # Context bridge: expõe APIs seguras ao renderer
  renderer/
    src/
      components/         Componentes React (formulário, lista, preview)
      invoice.types.ts    Tipos TypeScript compartilhados
      invoice.store.ts    Store Zustand com estado da aplicação
      invoice.compute.ts  Totais derivados e helpers de formatação
      invoice.format.ts   Formatadores de data, CNPJ e valores
      tax.calculate.ts    Tabelas de alíquotas e lógica de cálculo
```

## Distribuição

O build gera os instaladores em `dist/`.

| Plataforma | Formato                  | Comando              |
| :--------- | :----------------------- | :------------------- |
| Linux      | AppImage + `.deb`        | `npm run dist:linux` |
| Windows    | Instalador NSIS (`.exe`) | `npm run dist:win`   |

Para lançar uma nova versão:

```bash
npm run release        # patch: 1.0.1 -> 1.0.2
npm run release:minor  # minor: 1.0.1 -> 1.1.0
npm run release:major  # major: 1.0.1 -> 2.0.0
```

O script atualiza o `package.json`, cria o commit, adiciona a tag e envia ao repositório. Um workflow no GitHub Actions detecta a tag e publica os instaladores.
