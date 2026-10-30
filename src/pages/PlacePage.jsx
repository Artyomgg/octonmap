import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { QRCodeSVG } from 'qrcode.react' // 🔥 Импорт QR-кода
import { BookOpen, Copy, Check, Share2 } from 'lucide-react' // 🔥 Иконки
import styles from '../css/PlacePage.module.css'
import { fetchPlaceById } from '../lib/places'

export default function PlacePage() {
	const { id } = useParams()
	const [place, setPlace] = useState(null)
	const [loading, setLoading] = useState(true)
	const [imgError, setImgError] = useState(false)

	// Стейты для кнопок
	const [copied, setCopied] = useState(false)
	const [showQR, setShowQR] = useState(false)

	useEffect(() => {
		setImgError(false)
		setLoading(true)
		setPlace(null)
		fetchPlaceById(id)
			.then(setPlace)
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [id])

	const handleCopyLink = () => {
		navigator.clipboard.writeText(window.location.href)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	if (loading) return <p className={styles.loading}>Загрузка...</p>
	if (!place) return <p className={styles.loading}>Место не найдено</p>

	const hasPhoto = place.photo_url && place.photo_url.trim() && !imgError
	const pageUrl = window.location.href

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

			{/* 🔥 БЛОК С КНОПКАМИ ПОДЕЛИТЬСЯ */}
			<div className={styles.shareBlock}>
				<button onClick={handleCopyLink} className={styles.shareBtn}>
					{copied ? (
						<>
							<Check size={18} /> Скопировано
						</>
					) : (
						<>
							<Copy size={18} /> Скопировать ссылку
						</>
					)}
				</button>
				<button onClick={() => setShowQR(!showQR)} className={styles.shareBtn}>
					<Share2 size={18} /> {showQR ? 'Скрыть QR' : 'Показать QR-код'}
				</button>
			</div>

			{/* Сам QR-код */}
			{showQR && (
				<div className={styles.qrBox}>
					<QRCodeSVG value={pageUrl} size={180} bgColor='#ffffff' fgColor='#1b2a4a' level='H' />
					<p>Наведите камеру телефона, чтобы открыть эту страницу</p>
				</div>
			)}

			{place.description && <p className={styles.description}>{place.description}</p>}

			{/* 🔥 ВЫВОД БАЗОВОГО ТЕКСТА */}
			{place.base_script && (
				<div className={styles.scriptBox}>
					<h3 className={styles.scriptTitle}>
						<BookOpen size={18} /> Материал для экскурсовода
					</h3>
					<p className={styles.scriptText}>{place.base_script}</p>
				</div>
			)}

			<p className={styles.coords}>
				Координаты: {place.lat.toFixed(5)}, {place.lng.toFixed(5)}
			</p>
		</article>
	)
}
