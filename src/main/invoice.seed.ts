function buildSeedInvoices(): unknown[] {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const seed = [
    {
      id: "seed-001",
      number: "1",
      series: "001",
      issueDate: today,
      operationNature: "Venda de mercadoria",
      issuer: {
        companyName: "Minha Empresa Ltda",
        cnpj: "00000000000191",
        ie: "123456789",
        zipCode: "01310100",
        address: "Av. Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      },
      recipient: {
        companyName: "Cliente Exemplo S.A.",
        cnpj: "11222333000181",
        ie: "987654321",
        zipCode: "20040020",
        address: "Av. Rio Branco",
        number: "1",
        neighborhood: "Centro",
        city: "Rio de Janeiro",
        state: "RJ",
      },
      items: [
        {
          id: "item-001",
          description: "Produto de Exemplo",
          ncm: "84713012",
          cfop: "5102",
          unit: "UN",
          quantity: 2,
          unitPrice: 500,
          totalPrice: 1000,
          type: "produto",
        },
      ],
      taxRegime: "lucro_presumido",
      taxes: {
        current: {
          taxIcms: { enabled: true, rate: 18, base: 1000, amount: 180 },
          taxIss: { enabled: false, rate: 5, base: 0, amount: 0 },
          taxIpi: { enabled: true, rate: 10, base: 1000, amount: 100 },
          taxPis: { enabled: true, rate: 0.65, base: 1000, amount: 6.5 },
          taxCofins: { enabled: true, rate: 3, base: 1000, amount: 30 },
          taxIrpj: { enabled: true, rate: 4.8, base: 1000, amount: 48 },
          taxCsll: { enabled: true, rate: 2.88, base: 1000, amount: 28.8 },
        },
        reform: {
          taxCbs: { enabled: true, rate: 8.8, base: 1000, amount: 88 },
          taxIbs: { enabled: true, rate: 17.7, base: 1000, amount: 177 },
          taxIs: { enabled: false, rate: 0, base: 1000, amount: 0 },
        },
      },
      totalProducts: 1000,
      totalServices: 0,
      totalCurrentTaxes: 393.3,
      totalReformTaxes: 265,
      totalInvoice: 1393.3,
      additionalInfo: "Nota fiscal de demonstração — gerada automaticamente.",
      status: "rascunho",
      createdAt: now,
      updatedAt: now,
    },
  ];

  return seed;
}

export { buildSeedInvoices };
