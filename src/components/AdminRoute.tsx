import { Navigate } from 'react-router-dom';
import { storage } from '../utils/storage';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  if (!storage.isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}