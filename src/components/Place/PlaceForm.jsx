import { FileText, Map as MapIcon, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import styles from '../../css/Form.module.css'
import { geocodeAddress } from '../../lib/geocode'
import { createPlace } from '../../lib/places'
import MapView from '../Map/MapView'

const CATEGORIES = [
	'памятник',
	'мемориал',
	'доска',
	'могила',
	'улица',
	'архитектура',
	'сквер',
	'храм',
	'музей',
	'другое',
]

const BOUNDS = { minLat: 53.6935, maxLat: 54.0243, minLng: 27.3738, maxLng: 28.0165 }

function isInsideDistrict(latlng) {
	return (
		latlng.lat >= BOUNDS.minLat &&
		latlng.lat <= BOUNDS.maxLat &&
		latlng.lng >= BOUNDS.minLng &&
		latlng.lng <= BOUNDS.maxLng
	)
}

export default function PlaceForm({ onSuccess }) {
	const { user } = useAuth()
	const [mobileTab, setMobileTab] = useState('form')
	const mapRef = useRef(null)

	const [form, setForm] = useState({
		title: '',
		description: '',
		address: '',
		category: 'памятник',
		photo_url: '',
		base_script: '', // 🔥 Новое поле
	})
	const [point, setPoint] = useState(null)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')

	const [searchQuery, setSearchQuery] = useState('')
	const [searching, setSearching] = useState(false)
	const [targetCoords, setTargetCoords] = useState(null)
	const [searchHint, setSearchHint] = useState('')

	useEffect(() => {
		if (mobileTab === 'map' && mapRef.current) {
			setTimeout(() => {
				mapRef.current.invalidateSize()
			}, 150)
		}
	}, [mobileTab])

	const handleChange = e => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	const handleMapClick = latlng => {
		if (!isInsideDistrict(latlng)) {
			setError('Выбирайте точки только в пределах Октябрьского района Минска')
			return
		}
		setError('')
		setPoint(latlng)
		if (!form.address && searchQuery) {
			setForm(f => ({ ...f, address: searchQuery }))
		}
		if (window.innerWidth <= 768) {
			setMobileTab('form')
		}
	}

	const handleSearch = async e => {
		e.preventDefault()
		if (!searchQuery.trim()) return

		setSearching(true)
		setSearchHint('')
		setError('')

		try {
			const result = await geocodeAddress(searchQuery)
			if (!result) {
				setSearchHint('Адрес не найден. Попробуйте уточнить запрос.')
				return
			}

			setTargetCoords({ lat: result.lat, lng: result.lng })

			if (result.inDistrict) {
				setPoint({ lat: result.lat, lng: result.lng })
				setForm(f => ({ ...f, address: f.address || searchQuery }))
				setSearchHint('✓ Адрес найден. Точка отмечена.')
			} else {
				setSearchHint('⚠ Адрес за пределами района. Кликните по карте вручную.')
			}
		} catch (e) {
			console.error(e)
			setSearchHint('Ошибка поиска.')
		} finally {
			setSearching(false)
		}
	}

	const handleSubmit = async e => {
		e.preventDefault()
		setError('')

		if (!point) return setError('Кликните по карте или найдите адрес, чтобы поставить точку')
		if (!form.title.trim()) return setError('Введите название')

		try {
			setSaving(true)
			await createPlace({
				title: form.title,
				description: form.description,
				address: form.address,
				category: form.category,
				photo_url: form.photo_url.trim() || null,
				base_script: form.base_script.trim() || null, // 🔥 Передаем текст
				lat: point.lat,
				lng: point.lng,
				author_id: user.id,
				status: 'pending',
			})
			onSuccess?.()
		} catch (e) {
			console.error(e)
			setError('Ошибка при сохранении: ' + e.message)
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className={styles.layout}>
			<div className={styles.mobileTabs}>
				<button
					type='button'
					className={mobileTab === 'form' ? styles.mobileTabActive : styles.mobileTab}
					onClick={() => setMobileTab('form')}
				>
					<FileText size={16} /> Данные
				</button>
				<button
					type='button'
					className={mobileTab === 'map' ? styles.mobileTabActive : styles.mobileTab}
					onClick={() => setMobileTab('map')}
				>
					<MapIcon size={16} /> Карта {point && '✓'}
				</button>
			</div>

			<form
				className={`${styles.form} ${mobileTab === 'map' ? styles.hiddenMobile : ''}`}
				onSubmit={handleSubmit}
			>
				<h2>Новое место</h2>

				<div className={styles.searchBlock}>
					<label className={styles.searchLabel}>
						Найти адрес на карте
						<div className={styles.searchRow}>
							<input
								type='text'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								placeholder='ул. Кирова, 1'
								onKeyDown={e => e.key === 'Enter' && handleSearch(e)}
							/>
							<button
								type='button'
								onClick={handleSearch}
								disabled={searching}
								className={styles.searchBtn}
							>
								{searching ? '...' : <Search size={18} />}
							</button>
						</div>
					</label>
					{searchHint && (
						<p
							className={
								searchHint.startsWith('✓')
									? styles.hintOk
									: searchHint.startsWith('⚠')
										? styles.hintWarn
										: styles.hintErr
							}
						>
							{searchHint}
						</p>
					)}
				</div>

				{error && <div className={styles.error}>{error}</div>}

				<label>
					Название *
					<input
						name='title'
						value={form.title}
						onChange={handleChange}
						placeholder='Например: Памятник героям'
						required
					/>
				</label>

				<label>
					Категория
					<select name='category' value={form.category} onChange={handleChange}>
						{CATEGORIES.map(c => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>
				</label>

				<label>
					Адрес
					<input
						name='address'
						value={form.address}
						onChange={handleChange}
						placeholder='ул. Примерная, 1'
					/>
				</label>

				<label>
					Описание
					<textarea
						name='description'
						value={form.description}
						onChange={handleChange}
						rows={3}
						placeholder='История места...'
					/>
				</label>

				{/* 🔥 НОВОЕ ПОЛЕ: Базовый текст для экскурсии */}
				<label>
					Базовый текст для экскурсии
					<textarea
						name='base_script'
						value={form.base_script}
						onChange={handleChange}
						rows={4}
						placeholder='Напишите базовый рассказ об этом месте для гидов...'
					/>
				</label>

				<label>
					Ссылка на фото
					<input
						name='photo_url'
						type='url'
						value={form.photo_url}
						onChange={handleChange}
						placeholder='https://...'
					/>
				</label>

				{form.photo_url && (
					<img
						src={form.photo_url}
						alt='preview'
						className={styles.preview}
						onError={e => (e.target.style.display = 'none')}
						onLoad={e => (e.target.style.display = 'block')}
					/>
				)}

				<div className={styles.coords}>
					{point
						? `Координаты: ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
						: 'Точка не выбрана'}
				</div>

				<button type='submit' disabled={saving} className={styles.submit}>
					{saving ? 'Сохранение...' : 'Отправить на модерацию'}
				</button>
			</form>

			<div className={`${styles.mapArea} ${mobileTab === 'form' ? styles.hiddenMobile : ''}`}>
				<MapView
					onMapClick={handleMapClick}
					pickedPoint={point}
					targetCoords={targetCoords}
					mapRef={mapRef}
				/>
			</div>
		</div>
	)
}
