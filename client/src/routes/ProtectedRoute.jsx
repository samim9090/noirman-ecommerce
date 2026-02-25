import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageSpinner } from '../components/Skeleton';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <PageSpinner />;
    return user ? children : <Navigate to="/login" replace />;
}
