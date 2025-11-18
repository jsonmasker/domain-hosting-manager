import "./global.css";

import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Domains from "./pages/Domains";
import DomainsAdvanced from "./pages/DomainsAdvanced";
import Hosting from "./pages/Hosting";
import Clients from "./pages/Clients";
import Payments from "./pages/Payments";
import PaymentsAdvanced from "./pages/PaymentsAdvanced";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import DatabaseManagement from "./pages/DatabaseManagement";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="domainhub-ui-theme">
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/domains" element={<Domains />} />
          <Route path="/domains-advanced" element={<DomainsAdvanced />} />
          <Route path="/hosting" element={<Hosting />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/payments" element={<PaymentsAdvanced />} />
          <Route path="/payments-basic" element={<Payments />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/database" element={<DatabaseManagement />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
