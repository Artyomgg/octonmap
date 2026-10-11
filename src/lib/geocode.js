// Поиск координат по адресу через Nominatim (OpenStreetMap)
// Бесплатно, без ключей, но требует небольшой задержки между запросами (1 сек)

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

// Границы Октябрьского района — чтобы отсеивать результаты вне района
const BOUNDS = {
	minLat: 53.6935,
	maxLat: 54.0243,
	minLng: 27.3738,
	maxLng: 28.0165,
}

export async function geocodeAddress(query) {
	if (!query.trim()) return null

	// Добавляем «Минск» и «Октябрьский район» для точности
	const fullQuery = `${query}, Минск, Октябрьский район, Беларусь`

	const params = new URLSearchParams({
		q: fullQuery,
		format: 'json',
		limit: '5',
		addressdetails: '1',
		'accept-language': 'ru',
	})

	const response = await fetch(`${NOMINATIM_URL}?${params}`, {
		headers: {
			// Nominatim требует User-Agent
			'User-Agent': 'OktyabrskyMemoryMap/1.0 (student project)',
		},
	})

	if (!response.ok) {
		throw new Error('Ошибка геокодинга')
	}

	const data = await response.json()

	if (!data.length) return null

	// Фильтруем результаты — оставляем только те, что в границах района
	const inDistrict = data.filter(item => {
		const lat = parseFloat(item.lat)
		const lng = parseFloat(item.lon)
		return (
			lat >= BOUNDS.minLat && lat <= BOUNDS.maxLat && lng >= BOUNDS.minLng && lng <= BOUNDS.maxLng
		)
	})

	if (!inDistrict.length) {
		// Если точных попаданий нет — возвращаем первый результат
		// (пользователь сам решит, подходит ли)
		const first = data[0]
		return {
			lat: parseFloat(first.lat),
			lng: parseFloat(first.lon),
			displayName: first.display_name,
			inDistrict: false,
		}
	}

	const best = inDistrict[0]
	return {
		lat: parseFloat(best.lat),
		lng: parseFloat(best.lon),
		displayName: best.display_name,
		inDistrict: true,
	}
}
