import { Layout } from "./components/app.layout";
import { InvoiceForm } from "./components/invoice.form/invoice.form";
import { InvoiceList } from "./components/invoice.list";
import { InvoicePrint } from "./components/invoice.print";
import { useInvoiceStore } from "./invoice.store";

export default function App() {
  const { page } = useInvoiceStore();

  if (page === "print") {
    return <InvoicePrint />;
  }

  return (
    <Layout>
      {page === "list" && <InvoiceList />}
      {page === "form" && <InvoiceForm />}
    </Layout>
  );
}
