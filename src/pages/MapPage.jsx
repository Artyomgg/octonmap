import { BookOpen, FileDown, MapPin, Navigation, RotateCcw, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import MapView from '../components/Map/MapView'
import TourModal from '../components/Tour/TourModal'
import styles from '../css/MapPage.module.css'
import { exportTourToDocx } from '../lib/exportTour'
import { fetchApprovedPlaces } from '../lib/places'
import { findMatchingProposal } from '../lib/tourGenerator'

const CATEGORY_LABEL = {
	all: 'Все категории',
	памятник: 'Памятники',
	мемориал: 'Мемориалы',
	доска: 'Мемориальные доски',
	могила: 'Братские могилы',
	улица: 'Улицы',
	архитектура: 'Архитектура',
	сквер: 'Скверы и парки',
	храм: 'Храмы',
	музей: 'Музеи',
	другое: 'Другое',
}

const THEME_LABEL = {
	all: 'Всё подряд',
	война: 'Военная история',
	архитектура: 'Архитектура и храмы',
	природа: 'Скверы и улицы',
}

const COUNT_OPTIONS = [2, 3, 4, 5, 6, 8]

export default function MapPage() {
	const [places, setPlaces] = useState([])
	const [loading, setLoading] = useState(true)
	const [category, setCategory] = useState('all')
	const [query, setQuery] = useState('')
	const [activeId, setActiveId] = useState(null)
	const [mode, setMode] = useState('list')
	const mapRef = useRef(null)

	useEffect(() => {
		fetchApprovedPlaces()
			.then(setPlaces)
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [])

	const filtered = places.filter(p => {
		const matchesCategory = category === 'all' || p.category === category
		const q = query.trim().toLowerCase()
		const matchesQuery =
			!q || p.title?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q)
		return matchesCategory && matchesQuery
	})

	const handleSelect = place => {
		setActiveId(place.id)
		mapRef.current?.flyTo([place.lat, place.lng], 17, { duration: 0.8 })
	}

	return (
		<div className={styles.layout}>
			<aside className={styles.sidebar}>
				<div className={styles.tabs}>
					<button
						className={mode === 'list' ? styles.tabActive : styles.tab}
						onClick={() => setMode('list')}
					>
						<MapPin size={16} /> Все места
					</button>
					<button
						className={mode === 'tour' ? styles.tabActive : styles.tab}
						onClick={() => setMode('tour')}
					>
						<Navigation size={16} /> Экскурсия
					</button>
				</div>

				{mode === 'list' ? (
					<ListMode
						places={filtered}
						loading={loading}
						category={category}
						setCategory={setCategory}
						query={query}
						setQuery={setQuery}
						activeId={activeId}
						handleSelect={handleSelect}
					/>
				) : (
					<TourMode places={places} mapRef={mapRef} setActiveId={setActiveId} />
				)}
			</aside>

			<div className={styles.mapArea}>
				<MapView
					places={places}
					mapRef={mapRef}
					activeId={activeId}
					onMarkerClick={place => setActiveId(place.id)}
				/>
			</div>
		</div>
	)
}

function ListMode({
	places,
	loading,
	category,
	setCategory,
	query,
	setQuery,
	activeId,
	handleSelect,
}) {
	return (
		<>
			<div className={styles.searchWrap}>
				<Search size={16} className={styles.searchIcon} />
				<input
					type='search'
					placeholder='Поиск по названию или адресу...'
					value={query}
					onChange={e => setQuery(e.target.value)}
					className={styles.search}
				/>
			</div>

			<select
				value={category}
				onChange={e => setCategory(e.target.value)}
				className={styles.select}
			>
				{Object.entries(CATEGORY_LABEL).map(([key, label]) => (
					<option key={key} value={key}>
						{label}
					</option>
				))}
			</select>

			<div className={styles.counter}>
				Найдено: <strong>{places.length}</strong>
			</div>

			{loading ? (
				<p>Загрузка...</p>
			) : places.length === 0 ? (
				<div className={styles.empty}>
					<MapPin size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
					<p>Ничего не найдено</p>
				</div>
			) : (
				<ul className={styles.list}>
					{places.map(p => (
						<li
							key={p.id}
							className={`${styles.item} ${activeId === p.id ? styles.itemActive : ''}`}
						>
							<button onClick={() => handleSelect(p)} className={styles.itemBtn}>
								{p.photo_url ? (
									<img
										src={p.photo_url}
										alt={p.title}
										className={styles.thumb}
										onError={e => {
											e.target.style.display = 'none'
										}}
									/>
								) : (
									<div className={styles.thumbPlaceholder}>
										<MapPin size={20} />
									</div>
								)}
								<div className={styles.itemContent}>
									<strong>{p.title}</strong>
									<span className={styles.cat}>{p.category}</span>
									{p.address && <span className={styles.addr}>{p.address}</span>}
								</div>
							</button>
							<Link to={`/place/${p.id}`} className={styles.details}>
								→
							</Link>
						</li>
					))}
				</ul>
			)}

			<Link to='/add' className={styles.addBtn}>
				+ Добавить место
			</Link>
		</>
	)
}

function TourMode({ places, mapRef, setActiveId }) {
	const [theme, setTheme] = useState('all')
	const [count, setCount] = useState(3)
	const [selectedIds, setSelectedIds] = useState([])
	const [tour, setTour] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [exporting, setExporting] = useState(false)
	const [modalOpen, setModalOpen] = useState(false)

	const toggleSelected = id => {
		setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
	}

	const handleSearchProposals = async () => {
		setError('')
		setTour(null)
		setLoading(true)

		try {
			const match = await findMatchingProposal(places, theme, { count, selectedIds })
			if (match) {
				setTour(match)
				if (match.stops[0]) {
					setActiveId(match.stops[0].place.id)
					mapRef.current?.flyTo([match.stops[0].place.lat, match.stops[0].place.lng], 14, {
						duration: 1,
					})
				}
			} else {
				setError(
					'Пока нет готовых маршрутов по этим критериям. Попробуйте изменить выбор или предложите свой маршрут в "Лаборатории".',
				)
			}
		} catch (e) {
			console.error(e)
			setError('Ошибка поиска')
		} finally {
			setLoading(false)
		}
	}

	const handleDownload = async () => {
		if (!tour) return
		setExporting(true)
		try {
			await exportTourToDocx(tour)
		} catch (e) {
			console.error(e)
			alert('Ошибка экспорта: ' + e.message)
		} finally {
			setExporting(false)
		}
	}

	return (
		<>
			{!tour && (
				<>
					<label className={styles.tourLabel}>
						Тема
						<select
							value={theme}
							onChange={e => setTheme(e.target.value)}
							className={styles.select}
						>
							{Object.entries(THEME_LABEL).map(([key, label]) => (
								<option key={key} value={key}>
									{label}
								</option>
							))}
						</select>
					</label>

					<label className={styles.tourLabel}>
						Сколько объектов
						<select
							value={count}
							onChange={e => setCount(Number(e.target.value))}
							className={styles.select}
						>
							{COUNT_OPTIONS.map(c => (
								<option key={c} value={c}>
									{c} точек
								</option>
							))}
						</select>
					</label>

					<div className={styles.selectHint}>Отметьте места (выбрано: {selectedIds.length})</div>

					<ul className={styles.pickList}>
						{places.map(p => (
							<li key={p.id} className={styles.pickItem}>
								<label>
									<input
										type='checkbox'
										checked={selectedIds.includes(p.id)}
										onChange={() => toggleSelected(p.id)}
									/>
									<span>{p.title}</span>
								</label>
								<span className={styles.cat}>{p.category}</span>
							</li>
						))}
					</ul>

					<button onClick={handleSearchProposals} disabled={loading} className={styles.buildBtn}>
						{loading ? (
							'Поиск в базе...'
						) : (
							<>
								<Search size={18} style={{ marginRight: 8 }} />
								Найти готовую экскурсию
							</>
						)}
					</button>
				</>
			)}

			{error && <p className={styles.tourError}>{error}</p>}

			{tour && (
				<>
					<div className={styles.tourHeader}>
						{tour.isAuthor && (
							<span
								style={{
									fontSize: '11px',
									background: '#ffcc00',
									color: '#1b2a4a',
									padding: '2px 8px',
									borderRadius: '4px',
									fontWeight: 'bold',
								}}
							>
								Авторский маршрут
							</span>
						)}
						<h4 style={{ marginTop: '6px' }}>{tour.title}</h4>
						{tour.intro && <p className={styles.tourIntro}>{tour.intro}</p>}
					</div>

					<button onClick={() => setModalOpen(true)} className={styles.showFullBtn}>
						<BookOpen size={18} style={{ marginRight: 8 }} />
						Показать полный текст
					</button>

					<ol className={styles.tourList}>
						{tour.stops.map((stop, i) => {
							if (!stop || !stop.place) return null
							return (
								<li key={stop.place.id || i} className={styles.tourItem}>
									<div
										className={styles.tourItemHeader}
										onClick={() => {
											setActiveId(stop.place.id)
											mapRef.current?.flyTo([stop.place.lat, stop.place.lng], 17, { duration: 0.8 })
										}}
									>
										<span className={styles.tourIndex}>{i + 1}</span>
										<div className={styles.tourItemBody}>
											<strong>{stop.place.title}</strong>
											{stop.comment && <span className={styles.tourComment}>{stop.comment}</span>}
										</div>
									</div>
								</li>
							)
						})}
					</ol>

					{tour.outro && <p className={styles.tourOutro}>{tour.outro}</p>}

					<div className={styles.tourActions}>
						<button onClick={handleDownload} disabled={exporting} className={styles.downloadBtn}>
							{exporting ? (
								'Готовим файл...'
							) : (
								<>
									<FileDown size={16} style={{ marginRight: 6 }} />
									Скачать .docx
								</>
							)}
						</button>

						<button onClick={() => setTour(null)} className={styles.resetBtn}>
							<RotateCcw size={16} style={{ marginRight: 6 }} />
							Сбросить
						</button>
					</div>
				</>
			)}

			<TourModal
				tour={modalOpen ? tour : null}
				onClose={() => setModalOpen(false)}
				onDownload={handleDownload}
				exporting={exporting}
			/>
		</>
	)
}
