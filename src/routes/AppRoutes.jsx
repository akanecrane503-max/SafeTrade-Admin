import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import PageLayout from '../layout/PageLayout.jsx';
import { ROUTES } from '../utils/constants';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Users from '../pages/Users.jsx';
import UserDetail from '../pages/UserDetail.jsx';
import Deposits from '../pages/Deposits.jsx';
import Withdrawals from '../pages/Withdrawals.jsx';
import Wallets from '../pages/Wallets.jsx';
import Trades from '../pages/Trades.jsx';
import Announcements from '../pages/Announcements.jsx';
import Reports from '../pages/Reports.jsx';
import Settings from '../pages/Settings.jsx';
import AdminManagement from '../pages/AdminManagement.jsx';
import ActivityLog from '../pages/ActivityLog.jsx';
import SystemControl from '../pages/SystemControl.jsx';
import NotFound from '../pages/NotFound.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<PageLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.USERS} element={<Users />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path={ROUTES.DEPOSITS} element={<Deposits />} />
          <Route path={ROUTES.WITHDRAWALS} element={<Withdrawals />} />
          <Route path={ROUTES.WALLETS} element={<Wallets />} />
          <Route path={ROUTES.TRADES} element={<Trades />} />
          <Route path={ROUTES.ANNOUNCEMENTS} element={<Announcements />} />
          <Route path={ROUTES.REPORTS} element={<Reports />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
          <Route path={ROUTES.ADMIN_MANAGEMENT} element={<AdminManagement />} />
          <Route path={ROUTES.ACTIVITY_LOG} element={<ActivityLog />} />
          <Route path={ROUTES.SYSTEM_CONTROL} element={<SystemControl />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
