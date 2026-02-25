import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageSpinner } from '../components/Skeleton';

export default function AdminRoute({ children }) {
    const { user, loading, isAdmin } = useAuth();
    if (loading) return <PageSpinner />;
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;
    return children;
}
