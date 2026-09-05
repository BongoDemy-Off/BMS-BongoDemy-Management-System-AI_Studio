/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { Tasks } from './pages/Tasks';
import { Clients } from './pages/Clients';
import { Invoices } from './pages/Invoices';
import { HR } from './pages/HR';
import { Assets } from './pages/Assets';
import { Settings } from './pages/Settings';
import { Activity } from './pages/Activity';
import { Expense } from './pages/Expense';
import { Documents } from './pages/Documents';
import { Meetings } from './pages/Meetings';
import { Campaigns } from './pages/Campaigns';
import { Reports } from './pages/Reports';
import { Leads } from './pages/Leads';
import { Goals } from './pages/Goals';
import { Financials } from './pages/Financials';
import { SocialImpact } from './pages/SocialImpact';
import { Education } from './pages/Education';
import { Volunteers } from './pages/Volunteers';
import { Affiliates } from './pages/Affiliates';
import { Products } from './pages/Products';
import { Analytics } from './pages/Analytics';
import { ContentCalendar } from './pages/ContentCalendar';
import { Grants } from './pages/Grants';
import { LeadCapture } from './pages/LeadCapture';
import { Login } from './pages/Login';
import { ClientPortal } from './pages/ClientPortal';
import { AppProvider, useAppContext } from './context/AppContext';

function AppRouter() {
  const { currentUser } = useAppContext();

  if (!currentUser) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/lead-capture" element={<LeadCapture />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (currentUser.role === 'client') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/" element={<ClientPortal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/lead-capture" element={<LeadCapture />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="social-impact" element={<SocialImpact />} />
          <Route path="education" element={<Education />} />
          <Route path="volunteers" element={<Volunteers />} />
          <Route path="affiliates" element={<Affiliates />} />
          <Route path="products" element={<Products />} />
          <Route path="content" element={<ContentCalendar />} />
          <Route path="grants" element={<Grants />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="clients" element={<Clients />} />
          <Route path="financials" element={<Financials />} />
          <Route path="leads" element={<Leads />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="expense" element={<Expense />} />
          <Route path="documents" element={<Documents />} />
          <Route path="activity" element={<Activity />} />
          <Route path="goals" element={<Goals />} />
          <Route path="hr" element={<HR />} />
          <Route path="assets" element={<Assets />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
