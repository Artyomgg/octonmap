import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import styles from '../../css/Form.module.css'
import { createPlace, uploadPhoto } from '../../lib/places'
import MapView from '../Map/MapView'

const CATEGORIES = ['памятник', 'доска', 'могила', 'улица']

export default function PlaceForm({ onSuccess }) {
	const { user } = useAuth()
	const [form, setForm] = useState({
		title: '',
		description: '',
		address: '',
		category: 'памятник',
	})
	const [point, setPoint] = useState(null)
	const [photo, setPhoto] = useState(null)
	const [preview, setPreview] = useState(null)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')

	const handleChange = e => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	const handlePhoto = e => {
		const file = e.target.files[0]
		if (!file) return
		setPhoto(file)
		setPreview(URL.createObjectURL(file))
	}

	const handleSubmit = async e => {
		e.preventDefault()
		setError('')

		if (!point) return setError('Кликните по карте, чтобы поставить точку')
		if (!form.title.trim()) return setError('Введите название')

		try {
			setSaving(true)

			let photoUrl = null
			if (photo) {
				photoUrl = await uploadPhoto(photo, user.id)
			}

			await createPlace({
				...form,
				lat: point.lat,
				lng: point.lng,
				photo_url: photoUrl,
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
			<form className={styles.form} onSubmit={handleSubmit}>
				<h2>Новое место</h2>

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
						rows={4}
						placeholder='История места, факты...'
					/>
				</label>

				<label>
					Фото
					<input type='file' accept='image/*' onChange={handlePhoto} />
				</label>

				{preview && <img src={preview} alt='preview' className={styles.preview} />}

				<div className={styles.coords}>
					{point
						? `Координаты: ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
						: 'Кликните по карте справа, чтобы поставить точку'}
				</div>

				<button type='submit' disabled={saving} className={styles.submit}>
					{saving ? 'Сохранение...' : 'Отправить на модерацию'}
				</button>
			</form>

			<div className={styles.mapArea}>
				<MapView onMapClick={setPoint} pickedPoint={point} />
			</div>
		</div>
	)
}
