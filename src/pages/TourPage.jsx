import { BookOpen, Check, Copy, Share2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import styles from '../css/TourPage.module.css'
import { fetchApprovedPlaces } from '../lib/places'
import { supabase } from '../lib/supabase'

export default function TourPage() {
	const { id } = useParams()
	const [tour, setTour] = useState(null)
	const [loading, setLoading] = useState(true)
	const [copied, setCopied] = useState(false)
	const [showQR, setShowQR] = useState(false)

	useEffect(() => {
		const loadData = async () => {
			try {
				// 1. Загружаем сам маршрут
				const { data: proposal, error } = await supabase
					.from('tour_proposals')
					.select('*')
					.eq('id', id)
					.single()

				if (error || !proposal) throw new Error('Маршрут не найден')

				// 2. Загружаем все места, чтобы расшифровать ID
				const places = await fetchApprovedPlaces()

				// 3. Формируем полные данные
				const propPlaces = proposal.route_ids
					.map(pid => places.find(p => p.id === pid))
					.filter(Boolean)
				const customScripts = proposal.custom_scripts || {}

				const stops = propPlaces.map(p => ({
					place: p,
					script: customScripts[p.id] || p.base_script || 'Текст для этой точки пока не добавлен.',
				}))

				setTour({
					title: proposal.title,
					intro: proposal.description,
					stops: stops,
				})
			} catch (err) {
				console.error(err)
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [id])

	const handleCopyLink = () => {
		navigator.clipboard.writeText(window.location.href)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	if (loading) return <p className={styles.center}>Загрузка маршрута...</p>
	if (!tour) return <p className={styles.center}>Маршрут не найден или еще не одобрен.</p>

	const tourUrl = window.location.href

	return (
		<div className={styles.page}>
			<Link to='/map' className={styles.back}>
				← Назад к карте
			</Link>

			<div className={styles.header}>
				<span className={styles.badge}>Авторский маршрут</span>
				<h1>{tour.title}</h1>
				{tour.intro && <p className={styles.intro}>{tour.intro}</p>}

				<div className={styles.shareBlock}>
					<div className={styles.actions}>
						<button onClick={handleCopyLink} className={styles.btn}>
							{copied ? (
								<>
									<Check size={18} /> Ссылка скопирована
								</>
							) : (
								<>
									<Copy size={18} /> Скопировать ссылку
								</>
							)}
						</button>
						<button onClick={() => setShowQR(!showQR)} className={styles.btnPrimary}>
							<Share2 size={18} /> {showQR ? 'Скрыть QR-код' : 'Показать QR-код'}
						</button>
					</div>

					{showQR && (
						<div className={styles.qrBox}>
							<QRCodeSVG value={tourUrl} size={180} bgColor='#ffffff' fgColor='#1b2a4a' level='H' />
							<p>Наведите камеру телефона, чтобы открыть этот маршрут</p>
						</div>
					)}
				</div>
			</div>

			<ol className={styles.stops}>
				{tour.stops.map((stop, i) => (
					<li key={stop.place.id} className={styles.stopCard}>
						<div className={styles.stopHeader}>
							<span className={styles.stopNumber}>{i + 1}</span>
							<div>
								<h3>{stop.place.title}</h3>
								{stop.place.address && <p className={styles.addr}>📍 {stop.place.address}</p>}
							</div>
						</div>

						{stop.place.photo_url && (
							<img src={stop.place.photo_url} alt={stop.place.title} className={styles.photo} />
						)}

						<div className={styles.scriptBox}>
							<h4>
								<BookOpen size={16} /> Текст для экскурсовода
							</h4>
							<p>{stop.script}</p>
						</div>
					</li>
				))}
			</ol>
		</div>
	)
}
