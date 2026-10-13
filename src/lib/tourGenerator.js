// ========== ПРОКСИ НА RENDER ==========
const GROQ_URL = 'https://groq-api-3fdr.onrender.com/api/groq'

const MODEL = 'openai/gpt-oss-120b'

// === Утилита: retry для 429/503 ===
async function fetchWithRetry(url, options, maxRetries = 2) {
	for (let i = 0; i < maxRetries; i++) {
		const response = await fetch(url, options)
		if (response.ok) return response
		if ((response.status === 429 || response.status === 503) && i < maxRetries - 1) {
			const wait = 1500 * Math.pow(2, i)
			await new Promise(r => setTimeout(r, wait))
			continue
		}
		return response
	}
}

// === Общий вызов Groq через прокси ===
async function callGroq(systemPrompt, userPrompt, expectJson = true) {
	const body = {
		model: MODEL,
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: userPrompt },
		],
		temperature: 0.7,
		max_tokens: 8000, // 🔥 нужно для длинных текстов
	}

	if (expectJson) {
		body.response_format = { type: 'json_object' }
	}

	console.log('🔄 Запрос через прокси:', GROQ_URL)

	const response = await fetchWithRetry(GROQ_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	})

	if (!response.ok) {
		const errText = await response.text()
		console.error('❌ Groq proxy error:', response.status, errText.slice(0, 300))
		throw new Error(`Прокси вернул ${response.status}`)
	}

	const data = await response.json()
	let content = data.choices?.[0]?.message?.content

	if (!content) {
		console.error('❌ Groq response без content:', data)
		throw new Error('Нейросеть вернула пустой ответ')
	}

	// Убираем markdown-обёртку ```json ... ```
	content = content
		.replace(/^```json\s*/i, '')
		.replace(/```\s*$/i, '')
		.trim()

	if (!expectJson) return content

	try {
		return JSON.parse(content)
	} catch (e) {
		console.error('❌ Не удалось распарсить JSON:', content.slice(0, 300))
		throw new Error('Нейросеть вернула некорректный формат')
	}
}

// === 1. Подробная информация о месте (10 предложений) ===
export async function generatePlaceInfo(place) {
	const systemPrompt =
		'Ты — историк-краевед. Пишешь интересные факты о местах Минска для экскурсоводов.'

	const userPrompt = `Напиши ровно 10 предложений о месте:
Название: ${place.title}
Категория: ${place.category}
Адрес: ${place.address || 'не указан'}
Описание: ${place.description || 'нет'}

Требования:
- Пиши на русском, живо и увлекательно.
- Используй факты, исторический контекст, детали для экскурсовода.
- Не выдумывай точные даты и цифры, если не уверен.
- Верни СТРОГО JSON: {"info": "предложение1. предложение2. ... предложение10."}
- В поле info — ровно 10 предложений, разделённых пробелами или точками.`

	const result = await callGroq(systemPrompt, userPrompt)
	return result.info || ''
}

// === 2. Генерация экскурсии с полными текстами на 4 минуты ===
export async function generateTour(places, theme, options = {}) {
	const { count = 5, selectedIds = [] } = options

	if (!places.length) {
		throw new Error('Нет мест для экскурсии')
	}

	const themePrompts = {
		война: 'военной истории и памяти о Великой Отечественной войне',
		архитектура: 'архитектуры, храмов и исторических зданий',
		природа: 'скверов, парков и городской среды',
		all: 'истории и культуры района в целом',
	}
	const themeText = themePrompts[theme] || themePrompts.all

	const selected = places.filter(p => selectedIds.includes(p.id))
	const others = places.filter(p => !selectedIds.includes(p.id))

	const formatPlace = (p, idx) =>
		`${idx}. "${p.title}" — ${p.category}. ${p.description || ''}. Адрес: ${p.address || 'не указан'}`

	const selectedBlock =
		selected.length > 0
			? `Пользователь уже выбрал эти места (обязательно включи их в экскурсию):
${selected.map((p, i) => formatPlace(p, i + 1)).join('\n')}`
			: ''

	const othersBlock = `Остальные доступные места (можешь добавить их, если не хватает до ${count}):
${others.map((p, i) => formatPlace(p, selected.length + i + 1)).join('\n')}`

	const allIndexed = [...selected, ...others]

	const userPrompt = `Тема экскурсии: ${themeText}.
Нужно составить экскурсию ровно из ${count} мест.

${selectedBlock}

${othersBlock}

Требования:
- Если выбраны места — начни с них, сохрани порядок 1..${selected.length}.
- Добери недостающие до ${count} из остальных мест по теме.
- Выбирай места, логично связанные по теме или расположенные рядом.

🔥 ГЛАВНОЕ ТРЕБОВАНИЕ — ТЕКСТ РАССКАЗА:
Для КАЖДОЙ остановки напиши ПОЛНОЦЕННЫЙ ТЕКСТ для экскурсовода на 4 МИНУТЫ (примерно 500-600 слов).
Это должен быть живой рассказ, который экскурсовод читает вслух группе:
- Начни с того, что видит группа сейчас (внешний вид, атмосфера).
- Дай исторический контекст: когда появилось, кем, почему.
- Расскажи интересные факты, легенды, детали.
- Свяжи с более широкой историей района/города/страны.
- Закончи эмоциональным акцентом или риторическим вопросом.

Текст должен быть готов к чтению вслух — без markdown, без звёздочек, без заголовков внутри.
Используй простые предложения, ритмичную речь, обращения к группе ("обратите внимание", "перед вами", "представьте").

Формат ответа — СТРОГО JSON:
{
  "title": "Название экскурсии",
  "intro": "1-2 предложения вступления",
  "stops": [
    {
      "placeIndex": 1,
      "comment": "Короткая подпись для превью в интерфейсе (1-2 предложения)",
      "script": "Полный текст рассказа на 4 минуты (500-600 слов). Живой, устный, для чтения вслух."
    }
  ],
  "outro": "1 предложение завершения"
}

placeIndex — это номер из общего списка (1..${allIndexed.length}).`

	const systemPrompt =
		'Ты — опытный экскурсовод по Октябрьскому району Минска. Пишешь готовые тексты для устного рассказа. Отвечай строго в JSON без markdown.'

	const parsed = await callGroq(systemPrompt, userPrompt)

	const stops = (parsed.stops || [])
		.map(s => {
			const place = allIndexed[s.placeIndex - 1]
			return place
				? {
						place,
						comment: s.comment || '',
						script: s.script || s.comment || '',
					}
				: null
		})
		.filter(Boolean)

	return {
		title: parsed.title || 'Экскурсия',
		intro: parsed.intro || '',
		stops,
		outro: parsed.outro || '',
	}
}
