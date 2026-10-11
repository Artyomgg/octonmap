import { useState } from 'react'
import styles from '../../css/Modal.module.css'
import { updatePlace, uploadPhoto } from '../../lib/places'

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

const STATUSES = [
	{ value: 'pending', label: 'На модерации' },
	{ value: 'approved', label: 'Опубликовано' },
	{ value: 'rejected', label: 'Отклонено' },
]

export default function EditPlaceModal({ place, onClose, onSaved }) {
	const [form, setForm] = useState({
		title: place.title || '',
		description: place.description || '',
		address: place.address || '',
		category: place.category || 'памятник',
		status: place.status || 'pending',
		lat: place.lat,
		lng: place.lng,
		photo_url: place.photo_url || '',
	})
	const [photo, setPhoto] = useState(null)
	const [preview, setPreview] = useState(place.photo_url || null)
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
		setSaving(true)

		try {
			let photoUrl = form.photo_url
			if (photo) {
				photoUrl = await uploadPhoto(photo, place.author_id || 'admin')
			}

			await updatePlace(place.id, {
				title: form.title,
				description: form.description,
				address: form.address,
				category: form.category,
				status: form.status,
				lat: parseFloat(form.lat),
				lng: parseFloat(form.lng),
				photo_url: photoUrl,
			})

			onSaved?.()
			onClose?.()
		} catch (e) {
			console.error(e)
			setError('Ошибка сохранения: ' + e.message)
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className={styles.overlay} onClick={onClose}>
			<div className={styles.modal} onClick={e => e.stopPropagation()}>
				<div className={styles.modalHeader}>
					<h2>Редактирование места</h2>
					<button className={styles.closeBtn} onClick={onClose}>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className={styles.form}>
					{error && <div className={styles.error}>{error}</div>}

					<label>
						Название
						<input name='title' value={form.title} onChange={handleChange} required />
					</label>

					<div className={styles.row}>
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
							Статус
							<select name='status' value={form.status} onChange={handleChange}>
								{STATUSES.map(s => (
									<option key={s.value} value={s.value}>
										{s.label}
									</option>
								))}
							</select>
						</label>
					</div>

					<label>
						Адрес
						<input name='address' value={form.address} onChange={handleChange} />
					</label>

					<div className={styles.row}>
						<label>
							Широта (lat)
							<input
								name='lat'
								type='number'
								step='0.00001'
								value={form.lat}
								onChange={handleChange}
								required
							/>
						</label>
						<label>
							Долгота (lng)
							<input
								name='lng'
								type='number'
								step='0.00001'
								value={form.lng}
								onChange={handleChange}
								required
							/>
						</label>
					</div>

					<label>
						Описание
						<textarea
							name='description'
							value={form.description}
							onChange={handleChange}
							rows={4}
						/>
					</label>

					<label>
						Фото (если не менять — останется старое)
						<input type='file' accept='image/*' onChange={handlePhoto} />
					</label>

					{preview && <img src={preview} alt='preview' className={styles.preview} />}

					<div className={styles.actions}>
						<button type='button' onClick={onClose} className={styles.cancel}>
							Отмена
						</button>
						<button type='submit' disabled={saving} className={styles.save}>
							{saving ? 'Сохранение...' : 'Сохранить'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
