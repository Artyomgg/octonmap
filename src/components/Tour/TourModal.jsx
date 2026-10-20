import { BookOpen, FileDown, X } from 'lucide-react'
import { useEffect } from 'react'
import styles from '../../css/TourModal.module.css'

export default function TourModal({ tour, onClose, onDownload, exporting }) {
	useEffect(() => {
		const handler = e => {
			if (e.key === 'Escape') onClose()
		}
		window.addEventListener('keydown', handler)
		return () => window.removeEventListener('keydown', handler)
	}, [onClose])

	useEffect(() => {
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = ''
		}
	}, [])

	if (!tour) return null

	return (
		<div className={styles.overlay} onClick={onClose}>
			<div className={styles.modal} onClick={e => e.stopPropagation()}>
				<div className={styles.header}>
					<div className={styles.headerText}>
						<h1>{tour.title}</h1>
						<span className={styles.subtitle}>
							Октябрьский район · Минск · {tour.stops.length} остановок
						</span>
					</div>

					<div className={styles.headerActions}>
						<button onClick={onDownload} disabled={exporting} className={styles.downloadBtn}>
							{exporting ? (
								'⏳ Готовим...'
							) : (
								<>
									<FileDown size={16} style={{ marginRight: 6 }} />
									Скачать .docx
								</>
							)}
						</button>
						<button onClick={onClose} className={styles.closeBtn}>
							<X size={20} />
						</button>
					</div>
				</div>

				<div className={styles.content}>
					{tour.intro && <p className={styles.intro}>{tour.intro}</p>}

					{tour.stops.map((stop, i) => (
						<section key={stop.place.id} className={styles.stop}>
							<div className={styles.stopHeader}>
								<span className={styles.stopNumber}>{i + 1}</span>
								<div>
									<h2>{stop.place.title}</h2>
									<div className={styles.stopMeta}>
										{stop.place.category && (
											<span className={styles.badge}>{stop.place.category}</span>
										)}
										{stop.place.address && (
											<span className={styles.address}>📍 {stop.place.address}</span>
										)}
									</div>
								</div>
							</div>

							{stop.comment && <p className={styles.comment}>{stop.comment}</p>}

							{stop.script && (
								<div className={styles.scriptBlock}>
									<h3 className={styles.scriptTitle}>
										<BookOpen size={16} style={{ marginRight: 6 }} />
										Текст для экскурсовода (4 минуты)
									</h3>
									<div className={styles.scriptText}>
										{stop.script
											.split(/\n+/)
											.map(s => s.trim())
											.filter(Boolean)
											.map((p, idx) => (
												<p key={idx}>{p}</p>
											))}
									</div>
								</div>
							)}
						</section>
					))}

					{tour.outro && (
						<div className={styles.outro}>
							<p>{tour.outro}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
