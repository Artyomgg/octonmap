// Расстояние между двумя точками по формуле гаверсинуса (в метрах)
export function distanceBetween(a, b) {
	const R = 6371000 // радиус Земли в метрах
	const toRad = deg => (deg * Math.PI) / 180

	const dLat = toRad(b.lat - a.lat)
	const dLng = toRad(b.lng - a.lng)

	const lat1 = toRad(a.lat)
	const lat2 = toRad(b.lat)

	const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)

	return 2 * R * Math.asin(Math.sqrt(x))
}

// Строим маршрут из точек:
// - startPlace: с какой точки начинаем (или null — берём случайную)
// - maxCount: сколько точек максимум включить
// - maxDistance: максимальное расстояние между соседними точками (в метрах)
// - theme: 'война' | 'архитектура' | 'все'
export function buildRoute(places, { startPlace, maxCount, maxDistance, theme }) {
	// 1. Фильтр по теме
	let pool = [...places]

	if (theme === 'война') {
		pool = pool.filter(p => ['памятник', 'мемориал', 'могила', 'доска'].includes(p.category))
	} else if (theme === 'архитектура') {
		pool = pool.filter(p => ['архитектура', 'храм', 'музей'].includes(p.category))
	} else if (theme === 'природа') {
		pool = pool.filter(p => ['сквер', 'улица'].includes(p.category))
	}

	if (pool.length === 0) return []

	// 2. Стартовая точка
	let current = startPlace
		? pool.find(p => p.id === startPlace.id) || pool[0]
		: pool[Math.floor(Math.random() * pool.length)]

	const route = [current]
	const used = new Set([current.id])
	pool = pool.filter(p => p.id !== current.id)

	// 3. Жадно идём к ближайшей в пределах радиуса
	while (route.length < maxCount) {
		let nearest = null
		let nearestDist = Infinity

		for (const p of pool) {
			if (used.has(p.id)) continue
			const d = distanceBetween(current, p)
			if (d <= maxDistance && d < nearestDist) {
				nearest = p
				nearestDist = d
			}
		}

		if (!nearest) break

		route.push(nearest)
		used.add(nearest.id)
		current = nearest
	}

	return route
}

// Общая длина маршрута в метрах
export function totalDistance(route) {
	let total = 0
	for (let i = 0; i < route.length - 1; i++) {
		total += distanceBetween(route[i], route[i + 1])
	}
	return total
}

// Форматирование метров в читаемый вид
export function formatDistance(meters) {
	if (meters < 1000) return `${Math.round(meters)} м`
	return `${(meters / 1000).toFixed(2)} км`
}
