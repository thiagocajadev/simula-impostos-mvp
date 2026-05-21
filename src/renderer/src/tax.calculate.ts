import type { CurrentTaxes, InvoiceItem, ReformTaxes, TaxItem, TaxRegime } from "./invoice.types";

const CURRENT_TAX_LABELS: Record<keyof CurrentTaxes, string> = {
  taxIcms: "ICMS",
  taxIss: "ISS",
  taxIpi: "IPI",
  taxPis: "PIS",
  taxCofins: "COFINS",
  taxIrpj: "IRPJ",
  taxCsll: "CSLL",
};

const REFORM_TAX_LABELS: Record<keyof ReformTaxes, string> = {
  taxCbs: "CBS",
  taxIbs: "IBS",
  taxIs: "IS",
};

const TAX_DESCRIPTIONS: Record<string, string> = {
  taxIcms: "Imposto sobre Circulação de Mercadorias e Serviços",
  taxIss: "Imposto sobre Serviços de Qualquer Natureza",
  taxIpi: "Imposto sobre Produtos Industrializados",
  taxPis: "Programa de Integração Social",
  taxCofins: "Contribuição para o Financiamento da Seguridade Social",
  taxIrpj: "Imposto de Renda Pessoa Jurídica",
  taxCsll: "Contribuição Social sobre o Lucro Líquido",
  taxCbs: "Contribuição sobre Bens e Serviços — federal",
  taxIbs: "Imposto sobre Bens e Serviços — estadual/municipal",
  taxIs: "Imposto Seletivo — bens e serviços prejudiciais",
};

const TAX_BASE_LABELS: Record<string, string> = {
  taxIcms: "Produtos",
  taxIss: "Serviços",
  taxIpi: "Produtos",
  taxPis: "Receita bruta",
  taxCofins: "Receita bruta",
  taxIrpj: "Lucro presumido/real",
  taxCsll: "Lucro presumido/real",
  taxCbs: "Receita bruta",
  taxIbs: "Receita bruta",
  taxIs: "Receita bruta",
};

type CurrentRates = Record<keyof CurrentTaxes, number>;

const DEFAULT_RATES: Record<TaxRegime, CurrentRates> = {
  simples_nacional: {
    taxIcms: 0,
    taxIss: 0,
    taxIpi: 0,
    taxPis: 0,
    taxCofins: 0,
    taxIrpj: 0,
    taxCsll: 0,
  },
  mei: {
    taxIcms: 0,
    taxIss: 0,
    taxIpi: 0,
    taxPis: 0,
    taxCofins: 0,
    taxIrpj: 0,
    taxCsll: 0,
  },
  lucro_presumido: {
    taxIcms: 18,
    taxIss: 5,
    taxIpi: 10,
    taxPis: 0.65,
    taxCofins: 3,
    taxIrpj: 4.8,
    taxCsll: 2.88,
  },
  lucro_real: {
    taxIcms: 18,
    taxIss: 5,
    taxIpi: 10,
    taxPis: 1.65,
    taxCofins: 7.6,
    taxIrpj: 15,
    taxCsll: 9,
  },
};

const DEFAULT_REFORM_RATES = {
  taxCbs: 8.8,
  taxIbs: 17.7,
  taxIs: 0,
};

function makeTaxItem(enabled: boolean, rate: number): TaxItem {
  const taxItem = { enabled, rate, base: 0, amount: 0 };
  return taxItem;
}

function createDefaultCurrentTaxes(regime: TaxRegime): CurrentTaxes {
  const rates = DEFAULT_RATES[regime];
  const isActive = regime === "lucro_presumido" || regime === "lucro_real";
  const taxes: CurrentTaxes = {
    taxIcms: makeTaxItem(isActive, rates.taxIcms),
    taxIss: makeTaxItem(false, rates.taxIss),
    taxIpi: makeTaxItem(isActive, rates.taxIpi),
    taxPis: makeTaxItem(isActive, rates.taxPis),
    taxCofins: makeTaxItem(isActive, rates.taxCofins),
    taxIrpj: makeTaxItem(isActive, rates.taxIrpj),
    taxCsll: makeTaxItem(isActive, rates.taxCsll),
  };
  return taxes;
}

function createDefaultReformTaxes(): ReformTaxes {
  const taxes: ReformTaxes = {
    taxCbs: makeTaxItem(true, DEFAULT_REFORM_RATES.taxCbs),
    taxIbs: makeTaxItem(true, DEFAULT_REFORM_RATES.taxIbs),
    taxIs: makeTaxItem(false, DEFAULT_REFORM_RATES.taxIs),
  };
  return taxes;
}

function recalcCurrentTaxes(items: InvoiceItem[], taxes: CurrentTaxes): CurrentTaxes {
  const totalProducts = items
    .filter((item) => item.type === "product")
    .reduce((sum, item) => sum + item.totalPrice, 0);
  const totalServices = items
    .filter((item) => item.type === "service")
    .reduce((sum, item) => sum + item.totalPrice, 0);
  const total = totalProducts + totalServices;

  const computeTaxAmount = (tax: TaxItem, base: number): TaxItem => ({
    ...tax,
    base,
    amount: tax.enabled ? +((base * tax.rate) / 100).toFixed(2) : 0,
  });

  const result: CurrentTaxes = {
    taxIcms: computeTaxAmount(taxes.taxIcms, totalProducts),
    taxIss: computeTaxAmount(taxes.taxIss, totalServices),
    taxIpi: computeTaxAmount(taxes.taxIpi, totalProducts),
    taxPis: computeTaxAmount(taxes.taxPis, total),
    taxCofins: computeTaxAmount(taxes.taxCofins, total),
    taxIrpj: computeTaxAmount(taxes.taxIrpj, total),
    taxCsll: computeTaxAmount(taxes.taxCsll, total),
  };
  return result;
}

function recalcReformTaxes(items: InvoiceItem[], taxes: ReformTaxes): ReformTaxes {
  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const computeTaxAmount = (tax: TaxItem, base: number): TaxItem => ({
    ...tax,
    base,
    amount: tax.enabled ? +((base * tax.rate) / 100).toFixed(2) : 0,
  });

  const result: ReformTaxes = {
    taxCbs: computeTaxAmount(taxes.taxCbs, total),
    taxIbs: computeTaxAmount(taxes.taxIbs, total),
    taxIs: computeTaxAmount(taxes.taxIs, total),
  };
  return result;
}

function sumCurrentTaxes(taxes: CurrentTaxes): number {
  const total = +Object.values(taxes)
    .reduce((sum, tax) => sum + tax.amount, 0)
    .toFixed(2);
  return total;
}

function sumReformTaxes(taxes: ReformTaxes): number {
  const total = +Object.values(taxes)
    .reduce((sum, tax) => sum + tax.amount, 0)
    .toFixed(2);
  return total;
}

export {
  CURRENT_TAX_LABELS,
  REFORM_TAX_LABELS,
  TAX_DESCRIPTIONS,
  TAX_BASE_LABELS,
  createDefaultCurrentTaxes,
  createDefaultReformTaxes,
  recalcCurrentTaxes,
  recalcReformTaxes,
  sumCurrentTaxes,
  sumReformTaxes,
};
