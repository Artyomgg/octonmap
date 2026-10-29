import { supabase } from './supabase'

// === Поиск авторского маршрута по совпадению точек ===
export async function findMatchingProposal(places, theme, options) {
	const { count, selectedIds } = options

	// 1. Загружаем все одобренные предложения
	const { data: proposals, error } = await supabase
		.from('tour_proposals')
		.select('*')
		.eq('status', 'approved')

	if (error || !proposals || proposals.length === 0) return null

	// 2. Ищем маршруты с наибольшим количеством совпавших точек
	let bestMatch = null
	let maxMatches = 0

	proposals.forEach(prop => {
		// Если пользователь ничего не выбрал, берем любой маршрут нужной длины
		const matches = selectedIds.length === 0 
			? 1 
			: prop.route_ids.filter(id => selectedIds.includes(id)).length

		// Если совпадений больше, чем у предыдущего лучшего (и хотя бы одно), запоминаем
		if (
			matches > maxMatches ||
			(matches === maxMatches && maxMatches > 0 && prop.route_ids.length === count)
		) {
			maxMatches = matches
			bestMatch = prop
		}
	})

	if (!bestMatch) return null

	// 3. Формируем экскурсию из авторского маршрута
	const propPlaces = bestMatch.route_ids.map(id => places.find(p => p.id === id)).filter(Boolean)

	const customScripts = bestMatch.custom_scripts || {}

	const stops = propPlaces.map(p => {
		// Берем альтернативный текст гида, если он есть, иначе базовый из карточки места
		const script = customScripts[p.id] || p.base_script || 'Текст для этой точки пока не добавлен.'

		return {
			place: p,
			comment: `Авторский маршрут: ${bestMatch.title}`,
			script: script,
		}
	})

	return {
		id: bestMatch.id, // 🔥 ВАЖНО: ID для перехода на страницу
		title: bestMatch.title,
		intro: bestMatch.description || 'Авторский маршрут от гида.',
		stops: stops,
		outro: 'Приятной прогулки!',
		isAuthor: true,
	}
}