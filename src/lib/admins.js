import { supabase } from './supabase'

// Список всех пользователей
export async function fetchAllProfiles() {
	const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.order('created_at', { ascending: false })

	if (error) throw error
	return data
}

// Сделать админом / разжаловать
export async function setUserRole(userId, role) {
	const { data, error } = await supabase
		.from('profiles')
		.update({ role })
		.eq('id', userId)
		.select()
		.single()

	if (error) throw error
	return data
}
