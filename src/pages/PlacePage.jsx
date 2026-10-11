import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import styles from '../css/PlacePage.module.css'
import { fetchPlaceById } from '../lib/places'

export default function PlacePage() {
	const { id } = useParams()
	const [place, setPlace] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchPlaceById(id)
			.then(setPlace)
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [id])

	if (loading) return <p className={styles.loading}>Загрузка...</p>
	if (!place) return <p className={styles.loading}>Место не найдено</p>

	return (
		<article className={styles.page}>
			<Link to='/map' className={styles.back}>
				← Назад к карте
			</Link>

			{place.photo_url && <img src={place.photo_url} alt={place.title} className={styles.photo} />}

			<h1>{place.title}</h1>
			<span className={styles.badge}>{place.category}</span>

			{place.address && <p className={styles.address}>📍 {place.address}</p>}

			<p className={styles.description}>{place.description}</p>

			<p className={styles.coords}>
				Координаты: {place.lat.toFixed(5)}, {place.lng.toFixed(5)}
			</p>
		</article>
	)
}
