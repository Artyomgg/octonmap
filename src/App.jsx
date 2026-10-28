import { Route, Routes } from 'react-router'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Header from './components/Header/Header'
import { AuthProvider } from './context/AuthContext'

import NotFound from './components/NotFound'
import AddPlace from './pages/AddPlace'
import AdminPage from './pages/AdminPage'
import Home from './pages/Home'
import Login from './pages/Login'
import MapPage from './pages/MapPage'
import PlacePage from './pages/PlacePage'
import Profile from './pages/Profile'
import Register from './pages/Register'
import GuideLab from './pages/GuideLab'

export default function App() {
	return (
		<AuthProvider>
			<Header />
			<main>
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/map' element={<MapPage />} />
					<Route path='/place/:id' element={<PlacePage />} />
					<Route path='/login' element={<Login />} />
					<Route path='/register' element={<Register />} />

					<Route
						path='/add'
						element={
							<ProtectedRoute>
								<AddPlace />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/profile'
						element={
							<ProtectedRoute>
								<Profile />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/admin'
						element={
							<ProtectedRoute adminOnly>
								<AdminPage />
							</ProtectedRoute>
						}
					/>

					<Route path='/guide-lab' element={<GuideLab />} />

					<Route path='*' element={<NotFound />} />
				</Routes>
			</main>
		</AuthProvider>
	)
}
