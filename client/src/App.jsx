import { Navigate, Route, Routes } from "react-router-dom";
import { ShellLayout } from "./components/ShellLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { TicketsPage } from "./pages/TicketsPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { NewTicketPage } from "./pages/NewTicketPage";
import { MockLoginPage } from "./pages/MockLoginPage";
import { AssetsPage } from "./pages/AssetsPage";
import { KnowledgeBasePage } from "./pages/KnowledgeBasePage";
import { AuthProvider } from "./context/AuthContext";

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<MockLoginPage />} />
        <Route element={<ShellLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tickets/new" element={<NewTicketPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
