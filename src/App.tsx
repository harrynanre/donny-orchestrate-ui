import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import Index from "./pages/Index";
import Dashboard from "./pages/user/Dashboard";
import Projects from "./pages/user/Projects";
import Agents from "./pages/user/Agents";
import Tasks from "./pages/user/Tasks";
import Activity from "./pages/user/Activity";
import Marketplace from "./pages/user/Marketplace";
import Analytics from "./pages/user/Analytics";
import Settings from "./pages/user/Settings";
import Billing from "./pages/user/Billing";
import Terminal from "./pages/user/Terminal";
import Memory from "./pages/user/Memory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/user" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/user/projects" element={<DashboardLayout><Projects /></DashboardLayout>} />
            <Route path="/user/agents" element={<DashboardLayout><Agents /></DashboardLayout>} />
            <Route path="/user/tasks" element={<DashboardLayout><Tasks /></DashboardLayout>} />
            <Route path="/user/terminal" element={<DashboardLayout><Terminal /></DashboardLayout>} />
            <Route path="/user/memory" element={<DashboardLayout><Memory /></DashboardLayout>} />
            <Route path="/user/activity" element={<DashboardLayout><Activity /></DashboardLayout>} />
            <Route path="/user/marketplace" element={<DashboardLayout><Marketplace /></DashboardLayout>} />
            <Route path="/user/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
            <Route path="/user/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
            <Route path="/user/billing" element={<DashboardLayout><Billing /></DashboardLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
