import { FileText, List, Plus } from "lucide-react";
import logo from "../assets/logo.png";
import { useInvoiceStore } from "../invoice.store";

function Layout({ children }: { children: React.ReactNode }) {
  const { page, setPage, newInvoice } = useInvoiceStore();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <aside className="w-56 flex-shrink-0 bg-slate-900 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Simula Impostos" className="w-7 h-7 rounded-lg object-cover" />
            <div>
              <p className="text-white text-sm font-bold leading-tight">Simula</p>
              <p className="text-blue-400 text-xs font-medium leading-tight">Impostos BR</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <button
            type="button"
            onClick={() => setPage("list")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              page === "list"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <List size={16} />
            Notas Fiscais
          </button>

          <button
            type="button"
            onClick={newInvoice}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              page === "form"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Plus size={16} />
            Nova NF
          </button>
        </nav>

        <div className="px-5 py-4 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <FileText size={13} className="text-slate-500" />
            <span className="text-xs text-slate-500">Sem validade fiscal</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export { Layout };
