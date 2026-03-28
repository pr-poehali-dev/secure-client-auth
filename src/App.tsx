import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BankProvider, useBank } from "./context/BankContext";
import LoginPage from "./components/LoginPage";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Cashout from "./pages/Cashout";
import Cashin from "./pages/Cashin";
import Transfer from "./pages/Transfer";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Clients from "./pages/Clients";
import Credits from "./pages/Credits";
import Queue from "./pages/Queue";
import Cards from "./pages/Cards";
import Terminals from "./pages/Terminals";
import Employees from "./pages/Employees";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

function PageRouter() {
  const { state } = useBank();

  if (!state.isAuthenticated) return <LoginPage />;

  const pages: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    cashout: <Cashout />,
    cashin: <Cashin />,
    transfer: <Transfer />,
    history: <History />,
    reports: <Reports />,
    clients: <Clients />,
    credits: <Credits />,
    queue: <Queue />,
    cards: <Cards />,
    terminals: <Terminals />,
    employees: <Employees />,
    profile: <Profile />,
  };

  return (
    <Layout>
      {pages[state.currentPage] || <Dashboard />}
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BankProvider>
        <Toaster />
        <PageRouter />
      </BankProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
