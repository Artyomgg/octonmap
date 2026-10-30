import { BookOpen, Check, Copy, Download, Share2 } from 'lucide-react' // 🔥 Добавили Download
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import styles from '../css/PlacePage.module.css'
import { fetchPlaceById } from '../lib/places'

export default function PlacePage() {
	const { id } = useParams()
	const [place, setPlace] = useState(null)
	const [loading, setLoading] = useState(true)
	const [imgError, setImgError] = useState(false)

	const [copied, setCopied] = useState(false)
	const [showQR, setShowQR] = useState(false)

	// Ссылка на блок с QR-кодом, чтобы его скачать
	const qrRef = useRef(null)

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

	// 🔥 ФУНКЦИЯ СКАЧИВАНИЯ QR-КОДА
	const downloadQR = () => {
		const svg = qrRef.current.querySelector('svg')
		if (!svg) return

		const canvas = document.createElement('canvas')
		const ctx = canvas.getContext('2d')
		const svgData = new XMLSerializer().serializeToString(svg)
		const img = new Image()

		img.onload = () => {
			canvas.width = 500
			canvas.height = 500
			// Заливаем белым фоном (чтобы не было прозрачности)
			ctx.fillStyle = '#ffffff'
			ctx.fillRect(0, 0, canvas.width, canvas.height)
			// Рисуем QR
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

			// Скачиваем
			const pngFile = canvas.toDataURL('image/png')
			const downloadLink = document.createElement('a')
			downloadLink.download = `QR-${place.title}.png`
			downloadLink.href = pngFile
			downloadLink.click()
		}

		img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
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

			{/* Блок кнопок */}
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

			{/* Блок с QR-кодом */}
			{showQR && (
				<div className={styles.qrBox}>
					<div ref={qrRef} className={styles.qrImageWrapper}>
						<QRCodeSVG
							value={pageUrl}
							size={200}
							bgColor='#ffffff'
							fgColor='#1b2a4a'
							level='H'
							includeMargin={true}
						/>
					</div>
					<p>Наведите камеру, чтобы открыть страницу</p>

					{/* 🔥 Кнопка скачивания */}
					<button onClick={downloadQR} className={styles.downloadQrBtn}>
						<Download size={16} /> Скачать QR-код
					</button>
				</div>
			)}

			{place.description && <p className={styles.description}>{place.description}</p>}

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
