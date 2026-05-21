export type TaxRegime = "simples_nacional" | "mei" | "lucro_presumido" | "lucro_real";

export type OperationType = "product" | "service";

export type InvoiceStatus = "draft" | "issued";

export interface TaxItem {
  enabled: boolean;
  rate: number;
  base: number;
  amount: number;
}

export interface CurrentTaxes {
  taxIcms: TaxItem;
  taxIss: TaxItem;
  taxIpi: TaxItem;
  taxPis: TaxItem;
  taxCofins: TaxItem;
  taxIrpj: TaxItem;
  taxCsll: TaxItem;
}

export interface ReformTaxes {
  taxCbs: TaxItem;
  taxIbs: TaxItem;
  taxIs: TaxItem;
}

export interface InvoiceItem {
  id: string;
  description: string;
  ncm: string;
  cfop: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: OperationType;
}

export interface Party {
  companyName: string;
  taxId: string;
  stateRegistration: string;
  zipCode: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Invoice {
  id: string;
  number: string;
  series: string;
  issueDate: string;
  operationNature: string;
  issuer: Party;
  recipient: Party;
  items: InvoiceItem[];
  taxRegime: TaxRegime;
  taxes: {
    current: CurrentTaxes;
    reform: ReformTaxes;
  };
  totalProducts: number;
  totalServices: number;
  totalCurrentTaxes: number;
  totalReformTaxes: number;
  totalInvoice: number;
  additionalInfo: string;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}
