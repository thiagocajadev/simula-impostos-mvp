import { Layout } from "./components/Layout";
import { NFForm } from "./components/NFForm";
import { NFList } from "./components/NFList";
import { NFPrint } from "./components/NFPrint";
import { useNFStore } from "./store/useNFStore";

export default function App() {
  const { page } = useNFStore();

  if (page === "print") {
    return <NFPrint />;
  }

  return (
    <Layout>
      {page === "list" && <NFList />}
      {page === "form" && <NFForm />}
    </Layout>
  );
}
