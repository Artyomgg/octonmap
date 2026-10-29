import { ArrowRight, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import styles from '../css/Tours.module.css'
import { fetchApprovedPlaces } from '../lib/places'
import { supabase } from '../lib/supabase'

export default function ToursPage() {
	const [tours, setTours] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const loadData = async () => {
			try {
				// Загружаем одобренные маршруты
				const { data: proposals } = await supabase
					.from('tour_proposals')
					.select('*')
					.eq('status', 'approved')
					.order('created_at', { ascending: false })

				// Загружаем места для фото
				const places = await fetchApprovedPlaces()

				// Собираем данные для карточек
				const formattedTours = proposals.map(prop => {
					const firstPlaceId = prop.route_ids[0]
					const firstPlace = places.find(p => p.id === firstPlaceId)

					return {
						id: prop.id,
						title: prop.title,
						description: prop.description,
						stopsCount: prop.route_ids.length,
						coverImage: firstPlace?.photo_url || null,
					}
				})

				setTours(formattedTours)
			} catch (error) {
				console.error(error)
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [])

	if (loading) return <p style={{ textAlign: 'center', padding: '50px' }}>Загрузка маршрутов...</p>

	return (
		<div className={styles.page}>
			<div className={styles.header}>
				<h1>Авторские маршруты</h1>
				<p>Выбирайте готовые экскурсии от гидов и учителей или создайте свою в Лаборатории.</p>
			</div>

			<div className={styles.grid}>
				{tours.map(tour => (
					<Link to={`/tour/${tour.id}`} key={tour.id} className={styles.card}>
						<div className={styles.imageBox}>
							{tour.coverImage ? (
								<img src={tour.coverImage} alt={tour.title} />
							) : (
								<div className={styles.noImage}>
									<MapPin size={32} />
								</div>
							)}
							<span className={styles.badge}>{tour.stopsCount} точек</span>
						</div>
						<div className={styles.content}>
							<h3>{tour.title}</h3>
							<p>{tour.description}</p>
							<span className={styles.more}>
								Смотреть маршрут <ArrowRight size={16} />
							</span>
						</div>
					</Link>
				))}
			</div>
		</div>
	)
}
