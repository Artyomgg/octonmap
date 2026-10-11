import { supabase } from './supabase'

// Получить все одобренные места
export async function fetchApprovedPlaces() {
	const { data, error } = await supabase
		.from('places')
		.select('*')
		.eq('status', 'approved')
		.order('created_at', { ascending: false })

	if (error) throw error
	return data
}

// Получить одно место
export async function fetchPlaceById(id) {
	const { data, error } = await supabase.from('places').select('*').eq('id', id).single()

	if (error) throw error
	return data
}

// Получить места текущего пользователя
export async function fetchMyPlaces(userId) {
	const { data, error } = await supabase
		.from('places')
		.select('*')
		.eq('author_id', userId)
		.order('created_at', { ascending: false })

	if (error) throw error
	return data
}

// Получить места на модерации (для админа)
export async function fetchPendingPlaces() {
	const { data, error } = await supabase
		.from('places')
		.select('*')
		.eq('status', 'pending')
		.order('created_at', { ascending: true })

	if (error) throw error
	return data
}

// Создать место
export async function createPlace(place) {
	const { data, error } = await supabase.from('places').insert(place).select().single()

	if (error) throw error
	return data
}

// Обновить статус (админ)
export async function updatePlaceStatus(id, status) {
	const { data, error } = await supabase
		.from('places')
		.update({ status })
		.eq('id', id)
		.select()
		.single()

	if (error) throw error
	return data
}

// Удалить место
export async function deletePlace(id) {
	const { error } = await supabase.from('places').delete().eq('id', id)
	if (error) throw error
}

// Загрузить фото в Storage
export async function uploadPhoto(file, userId) {
	const ext = file.name.split('.').pop()
	const fileName = `${userId}/${Date.now()}.${ext}`

	const { error: uploadError } = await supabase.storage.from('place-photos').upload(fileName, file)

	if (uploadError) throw uploadError

	const { data } = supabase.storage.from('place-photos').getPublicUrl(fileName)

	return data.publicUrl
}

// Обновить место (админ)
export async function updatePlace(id, updates) {
	const { data, error } = await supabase
		.from('places')
		.update(updates)
		.eq('id', id)
		.select()
		.single()

	if (error) throw error
	return data
}

// Получить все места (для админа — включая pending и rejected)
export async function fetchAllPlaces() {
	const { data, error } = await supabase
		.from('places')
		.select('*')
		.order('created_at', { ascending: false })

	if (error) throw error
	return data
}
