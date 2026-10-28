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

// Получить все предложенные маршруты (для админа)
export async function fetchAllProposals() {
	const { data, error } = await supabase
		.from('tour_proposals')
		.select('*') // 🔥 Просто берем все поля, без сложных связей
		.order('created_at', { ascending: false })

	if (error) {
		console.error('Ошибка загрузки маршрутов:', error)
		throw error
	}
	return data
}

// Обновить статус маршрута (одобрить/отклонить)
export async function updateProposalStatus(id, status) {
	const { data, error } = await supabase
		.from('tour_proposals')
		.update({ status })
		.eq('id', id)
		.select()
		.single()

	if (error) throw error
	return data
}
