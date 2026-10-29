import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp, FileText, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth } from '../context/AuthContext'
import styles from '../css/GuideLab.module.css'
import { fetchApprovedPlaces } from '../lib/places'
import { supabase } from '../lib/supabase'

export default function EditTourPage() {
	const { id } = useParams()
	const { user, isAdmin } = useAuth()
	const navigate = useNavigate()

	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [selectedIds, setSelectedIds] = useState([])
	const [customScripts, setCustomScripts] = useState({})

	const [saving, setSaving] = useState(false)
	const [success, setSuccess] = useState(false)
	const [error, setError] = useState('')

	const [places, setPlaces] = useState([])
	const [loading, setLoading] = useState(true)
	const [expandedId, setExpandedId] = useState(null)

	useEffect(() => {
		const loadData = async () => {
			try {
				if (!user) {
					navigate('/login')
					return
				}

				const { data: proposal, error: propError } = await supabase
					.from('tour_proposals')
					.select('*')
					.eq('id', id)
					.single()

				if (propError || !proposal) throw new Error('Маршрут не найден')

				// 🔥 ПРОВЕРКА: Или это автор маршрута, ИЛИ это админ
				if (proposal.author_id !== user.id && !isAdmin) {
					navigate('/profile')
					return
				}

				setTitle(proposal.title)
				setDescription(proposal.description || '')
				setSelectedIds(proposal.route_ids || [])
				setCustomScripts(proposal.custom_scripts || {})

				const placesData = await fetchApprovedPlaces()
				setPlaces(placesData)
			} catch (err) {
				console.error(err)
				setError('Не удалось загрузить маршрут')
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [id, user, isAdmin, navigate])

	const togglePlace = placeId => {
		setSelectedIds(prev => {
			if (prev.includes(placeId)) {
				const newScripts = { ...customScripts }
				delete newScripts[placeId]
				setCustomScripts(newScripts)
				return prev.filter(x => x !== placeId)
			} else {
				return [...prev, placeId]
			}
		})
	}

	const handleCustomScriptChange = (placeId, text) => {
		setCustomScripts(prev => ({ ...prev, [placeId]: text }))
	}

	const movePlace = (index, direction) => {
		const newIds = [...selectedIds]
		const newIndex = direction === 'up' ? index - 1 : index + 1
		if (newIndex < 0 || newIndex >= newIds.length) return
		const temp = newIds[index]
		newIds[index] = newIds[newIndex]
		newIds[newIndex] = temp
		setSelectedIds(newIds)
	}

	const handleSubmit = async e => {
		e.preventDefault()
		if (!title.trim()) return setError('Введите название маршрута')
		if (selectedIds.length < 2) return setError('Выберите минимум 2 точки')

		setSaving(true)
		setError('')

		try {
			const { error: dbError } = await supabase
				.from('tour_proposals')
				.update({
					title: title,
					description: description,
					route_ids: selectedIds,
					custom_scripts: Object.keys(customScripts).length > 0 ? customScripts : null,
					status: 'pending', // При редактировании возвращаем на модерацию
				})
				.eq('id', id)

			if (dbError) throw dbError

			setSuccess(true)
			// Если это админ, возвращаем его в админку, если автор - в профиль
			setTimeout(() => navigate(isAdmin ? '/admin' : '/profile'), 2000)
		} catch (err) {
			console.error(err)
			setError('Ошибка при сохранении: ' + err.message)
		} finally {
			setSaving(false)
		}
	}

	const routePlaces = selectedIds.map(pid => places.find(p => p.id === pid)).filter(Boolean)

	if (loading) return <div className={styles.page}>Загрузка...</div>
	if (success) {
		return (
			<div className={styles.page}>
				<div className={styles.successBox}>
					<CheckCircle size={48} color='#1a7a3a' />
					<h2>Маршрут обновлен!</h2>
					<p>Изменения отправлены на модерацию. Перенаправляем...</p>
				</div>
			</div>
		)
	}

	return (
		<div className={styles.page}>
			<div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
				<Link
					to={isAdmin ? '/admin' : '/profile'}
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: '8px',
						color: '#6b7a99',
						textDecoration: 'none',
						marginBottom: '20px',
					}}
				>
					<ArrowLeft size={16} /> {isAdmin ? 'Назад в админку' : 'Назад в профиль'}
				</Link>

				<div className={styles.header} style={{ textAlign: 'left', marginBottom: '30px' }}>
					<h1 style={{ fontSize: '28px' }}>Редактирование маршрута</h1>
					<p style={{ margin: 0 }}>
						Внесите изменения. После сохранения маршрут снова уйдет на модерацию.
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
							required
							className={styles.titleInput}
						/>
					</label>

					<label>
						Краткое описание
						<textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
					</label>

					{selectedIds.length > 0 && (
						<div style={{ marginTop: '30px', marginBottom: '30px' }}>
							<h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#1b2a4a' }}>
								Порядок точек ({selectedIds.length})
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

										{p.base_script && (
											<div className={styles.baseScriptBox}>
												<strong style={{ fontSize: '12px', color: '#6b7a99' }}>
													Базовый текст:
												</strong>
												<p>{p.base_script}</p>
											</div>
										)}

										<button
											type='button'
											className={styles.toggleAltBtn}
											onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
										>
											<FileText size={14} />
											{customScripts[p.id] ? 'Изменить свой текст' : 'Предложить свой текст'}
											{expandedId === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
										</button>

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

					<div className={styles.placesBlock}>
						<h3>Добавить места в маршрут</h3>
						{loading ? (
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
							'Сохранение...'
						) : (
							<>
								<Send size={18} /> Сохранить изменения
							</>
						)}
					</button>
				</form>
			</div>
		</div>
	)
}
