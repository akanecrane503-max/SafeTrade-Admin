import AppRoutes from './routes/AppRoutes.jsx';
import { ToastProvider } from './components/common/Toast.jsx';
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';

export default function App() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AdminAuthProvider>
  );
}
