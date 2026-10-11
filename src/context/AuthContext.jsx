import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [profile, setProfile] = useState(null) // ← новое
	const [loading, setLoading] = useState(true)

	const loadProfile = async userId => {
		const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

		if (!error) setProfile(data)
	}

	useEffect(() => {
		supabase.auth.getSession().then(async ({ data: { session } }) => {
			const u = session?.user ?? null
			setUser(u)
			if (u) await loadProfile(u.id)
			setLoading(false)
		})

		const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
			const u = session?.user ?? null
			setUser(u)
			if (u) await loadProfile(u.id)
			else setProfile(null)
		})

		return () => listener.subscription.unsubscribe()
	}, [])

	const signUp = (email, password) => supabase.auth.signUp({ email, password })
	const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
	const signOut = () => supabase.auth.signOut()

	const isAdmin = profile?.role === 'admin'

	return (
		<AuthContext.Provider
			value={{ user, profile, isAdmin, loading, signUp, signIn, signOut, loadProfile }}
		>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => useContext(AuthContext)
