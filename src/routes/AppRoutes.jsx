import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import PageLayout from '../layout/PageLayout.jsx';
import { ROUTES } from '../utils/constants';

// Pages are imported directly (not lazy-loaded) for simplicity here.
// Swap to React.lazy + Suspense later if bundle size becomes a concern.
import Login from '../pages/Login.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Users from '../pages/Users.jsx';
import Deposits from '../pages/Deposits.jsx';
import Withdrawals from '../pages/Withdrawals.jsx';
import Wallets from '../pages/Wallets.jsx';
import Trades from '../pages/Trades.jsx';
import Announcements from '../pages/Announcements.jsx';
import Reports from '../pages/Reports.jsx';
import Settings from '../pages/Settings.jsx';
import NotFound from '../pages/NotFound.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />

      {/* Protected routes, wrapped in the dashboard shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<PageLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.USERS} element={<Users />} />
          <Route path={ROUTES.DEPOSITS} element={<Deposits />} />
          <Route path={ROUTES.WITHDRAWALS} element={<Withdrawals />} />
          <Route path={ROUTES.WALLETS} element={<Wallets />} />
          <Route path={ROUTES.TRADES} element={<Trades />} />
          <Route path={ROUTES.ANNOUNCEMENTS} element={<Announcements />} />
          <Route path={ROUTES.REPORTS} element={<Reports />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
