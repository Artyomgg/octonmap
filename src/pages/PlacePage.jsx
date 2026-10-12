import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import styles from '../css/PlacePage.module.css'
import { fetchPlaceById } from '../lib/places'

export default function PlacePage() {
	const { id } = useParams()
	const [place, setPlace] = useState(null)
	const [loading, setLoading] = useState(true)
	const [imgError, setImgError] = useState(false)

	useEffect(() => {
		console.log('🎬 [PlacePage] useEffect сработал, id из useParams =', id)
		console.log('🎬 [PlacePage] тип id =', typeof id)

		setImgError(false)
		setLoading(true)
		setPlace(null)

		fetchPlaceById(id)
			.then(data => {
				console.log('✅ [PlacePage] Пришло в .then:', data)
				console.log('✅ [PlacePage] photo_url в .then:', data?.photo_url)
				setPlace(data)
			})
			.catch(err => {
				console.error('❌ [PlacePage] Ошибка:', err)
			})
			.finally(() => setLoading(false))
	}, [id])

	if (loading) return <p className={styles.loading}>Загрузка...</p>
	if (!place) return <p className={styles.loading}>Место не найдено</p>

	const hasPhoto = place.photo_url && place.photo_url.trim() && !imgError

	return (
		<article className={styles.page}>
			<Link to='/map' className={styles.back}>
				← Назад к карте
			</Link>

			{hasPhoto ? (
				<img
					src={place.photo_url.trim()}
					alt={place.title}
					className={styles.photo}
					onError={() => setImgError(true)}
				/>
			) : (
				<div className={styles.photoPlaceholder}>Нет фото</div>
			)}

			<h1>{place.title}</h1>
			<span className={styles.badge}>{place.category}</span>

			{place.address && <p className={styles.address}>📍 {place.address}</p>}

			{place.description && <p className={styles.description}>{place.description}</p>}

			<p className={styles.coords}>
				Координаты: {place.lat.toFixed(5)}, {place.lng.toFixed(5)}
			</p>
		</article>
	)
}
