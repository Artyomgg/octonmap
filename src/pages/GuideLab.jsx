import { CheckCircle, ChevronDown, ChevronUp, FileText, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from '../css/GuideLab.module.css'
import { fetchApprovedPlaces } from '../lib/places'
import { supabase } from '../lib/supabase'

export default function GuideLab() {
	const { user } = useAuth()
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')

	// 🔥 Храним порядок выбранных точек
	const [selectedIds, setSelectedIds] = useState([])

	// 🔥 Храним альтернативные тексты (если гид захочет изменить)
	const [customScripts, setCustomScripts] = useState({})

	const [saving, setSaving] = useState(false)
	const [success, setSuccess] = useState(false)
	const [error, setError] = useState('')

	const [places, setPlaces] = useState([])
	const [loadingPlaces, setLoadingPlaces] = useState(true)

	// Для раскрытия блока с альтернативным текстом
	const [expandedId, setExpandedId] = useState(null)

	useEffect(() => {
		fetchApprovedPlaces()
			.then(setPlaces)
			.catch(console.error)
			.finally(() => setLoadingPlaces(false))
	}, [])

	const togglePlace = id => {
		setSelectedIds(prev => {
			if (prev.includes(id)) {
				// Убираем из маршрута и удаляем альтернативный текст
				const newScripts = { ...customScripts }
				delete newScripts[id]
				setCustomScripts(newScripts)
				return prev.filter(x => x !== id)
			} else {
				// Добавляем в конец маршрута
				return [...prev, id]
			}
		})
	}

	const handleCustomScriptChange = (id, text) => {
		setCustomScripts(prev => ({ ...prev, [id]: text }))
	}

	// Перемещение точки вверх/вниз по маршруту
	const movePlace = (index, direction) => {
		const newIds = [...selectedIds]
		const newIndex = direction === 'up' ? index - 1 : index + 1
		if (newIndex < 0 || newIndex >= newIds.length) return

		// Меняем местами
		const temp = newIds[index]
		newIds[index] = newIds[newIndex]
		newIds[newIndex] = temp
		setSelectedIds(newIds)
	}

	const handleSubmit = async e => {
		e.preventDefault()
		if (!title.trim()) return setError('Введите название маршрута')
		if (selectedIds.length < 2) return setError('Выберите минимум 2 точки для маршрута')

		setSaving(true)
		setError('')

		try {
			const { error: dbError } = await supabase.from('tour_proposals').insert({
				title: title,
				description: description,
				route_ids: selectedIds,
				// Передаем только те тексты, которые реально заполнены
				custom_scripts: Object.keys(customScripts).length > 0 ? customScripts : null,
				author_id: user.id,
				status: 'pending',
			})

			if (dbError) throw dbError

			setSuccess(true)
			setTitle('')
			setDescription('')
			setSelectedIds([])
			setCustomScripts({})
		} catch (err) {
			console.error(err)
			setError('Ошибка при отправке: ' + err.message)
		} finally {
			setSaving(false)
		}
	}

	// ... (проверки !user и success оставляем как были)

	// Получаем объекты выбранных мест в нужном порядке
	const routePlaces = selectedIds.map(id => places.find(p => p.id === id)).filter(Boolean)

	return (
		<div className={styles.page}>
			<div className={styles.header}>
				<h1>Лаборатория экскурсоводов</h1>
				<p>
					Соберите свой маршрут из существующих мест. Вы можете предложить свой вариант текста для
					любой точки.
				</p>
			</div>

			<form onSubmit={handleSubmit} className={styles.form}>
				{error && <div className={styles.error}>{error}</div>}

				<label>
					Название маршрута *
					<input
						type='text'
						value={title}
						onChange={e => setTitle(e.target.value)}
						placeholder='Например: Тайны купеческого Минска'
						required
						className={styles.titleInput}
					/>
				</label>

				<label>
					Краткое описание
					<textarea
						value={description}
						onChange={e => setDescription(e.target.value)}
						rows={3}
						placeholder='Для кого этот маршрут и в чем его особенность?'
					/>
				</label>

				{/* 🔥 Блок формирования маршрута */}
				{selectedIds.length > 0 && (
					<div style={{ marginTop: '30px', marginBottom: '30px' }}>
						<h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#1b2a4a' }}>
							Ваш маршрут ({selectedIds.length} точек)
						</h3>

						<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
							{routePlaces.map((p, index) => (
								<div key={p.id} className={styles.routeItem}>
									<div className={styles.routeHeader}>
										<span className={styles.routeNumber}>{index + 1}</span>
										<div className={styles.routeInfo}>
											<strong>{p.title}</strong>
											<span>{p.category}</span>
										</div>
										<div className={styles.routeControls}>
											<button
												type='button'
												onClick={() => movePlace(index, 'up')}
												disabled={index === 0}
												className={styles.moveBtn}
											>
												↑
											</button>
											<button
												type='button'
												onClick={() => movePlace(index, 'down')}
												disabled={index === routePlaces.length - 1}
												className={styles.moveBtn}
											>
												↓
											</button>
											<button
												type='button'
												onClick={() => togglePlace(p.id)}
												className={styles.removeBtn}
											>
												✕
											</button>
										</div>
									</div>

									{/* Базовый текст */}
									{p.base_script && (
										<div className={styles.baseScriptBox}>
											<strong style={{ fontSize: '12px', color: '#6b7a99' }}>Базовый текст:</strong>
											<p>{p.base_script}</p>
										</div>
									)}

									{/* Кнопка раскрытия альтернативного текста */}
									<button
										type='button'
										className={styles.toggleAltBtn}
										onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
									>
										<FileText size={14} />
										{customScripts[p.id] ? 'Изменить свой текст' : 'Предложить свой текст'}
										{expandedId === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
									</button>

									{/* Поле для своего текста */}
									{expandedId === p.id && (
										<textarea
											className={styles.altTextarea}
											value={customScripts[p.id] || ''}
											onChange={e => handleCustomScriptChange(p.id, e.target.value)}
											placeholder='Напишите ваш вариант рассказа для этой точки. Если оставить пустым, будет использован базовый текст.'
											rows={4}
										/>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Список всех мест для добавления */}
				<div className={styles.placesBlock}>
					<h3>Добавить места в маршрут</h3>
					{loadingPlaces ? (
						<p>Загрузка...</p>
					) : (
						<div className={styles.placesGrid} style={{ maxHeight: '300px' }}>
							{places.map(p => {
								const isSelected = selectedIds.includes(p.id)
								return (
									<div
										key={p.id}
										className={`${styles.placeItem} ${isSelected ? styles.placeActive : ''}`}
										onClick={() => !isSelected && togglePlace(p.id)}
										style={{
											cursor: isSelected ? 'default' : 'pointer',
											opacity: isSelected ? 0.6 : 1,
										}}
									>
										<div>
											<strong>{p.title}</strong>
											<span>{p.category}</span>
										</div>
										{isSelected ? <CheckCircle size={18} color='#1a7a3a' /> : <span>+</span>}
									</div>
								)
							})}
						</div>
					)}
				</div>

				<button type='submit' disabled={saving} className={styles.submitBtn}>
					{saving ? (
						'Отправка...'
					) : (
						<>
							<Send size={18} /> Отправить на модерацию
						</>
					)}
				</button>
			</form>
		</div>
	)
}
