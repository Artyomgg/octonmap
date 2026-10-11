import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
	const { user, isAdmin, loading } = useAuth()
	const location = useLocation()

	if (loading) return <p style={{ padding: 20 }}>Загрузка...</p>
	if (!user) return <Navigate to='/login' state={{ from: location }} replace />
	if (adminOnly && !isAdmin) return <Navigate to='/' replace />

	return children
}
