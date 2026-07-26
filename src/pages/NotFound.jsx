import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { ROUTES } from '../utils/constants';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-slate-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">404</h1>
        <p className="text-sm text-slate-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to={ROUTES.DASHBOARD} className="btn-primary inline-block">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
