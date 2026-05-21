import { Component, type ErrorInfo, type ReactNode } from "react";
import { Layout } from "./components/app.layout";
import { InvoiceForm } from "./components/invoice.form/invoice.form";
import { InvoiceList } from "./components/invoice.list";
import { InvoicePrint } from "./components/invoice.print";
import { useInvoiceStore } from "./invoice.store";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error.message, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: "monospace", color: "#c00" }}>
          <strong>Erro de renderização:</strong>
          <pre style={{ marginTop: 8, fontSize: 12, whiteSpace: "pre-wrap" }}>
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppRoutes() {
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

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}
