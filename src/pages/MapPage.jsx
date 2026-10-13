import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import MapView from '../components/Map/MapView'
import styles from '../css/MapPage.module.css'
import { exportTourToDocx } from '../lib/exportTour'
import { fetchApprovedPlaces } from '../lib/places'
import { generateTour } from '../lib/tourGenerator'

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
						📍 Все
					</button>
					<button
						className={mode === 'tour' ? styles.tabActive : styles.tab}
						onClick={() => setMode('tour')}
					>
						🧭 Экскурсия
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
			<input
				type='search'
				placeholder='Поиск по названию или адресу...'
				value={query}
				onChange={e => setQuery(e.target.value)}
				className={styles.search}
			/>

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
				<p className={styles.empty}>Ничего не найдено</p>
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
									<div className={styles.thumbPlaceholder}>📍</div>
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

	const toggleSelected = id => {
		setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
	}

	const handleGenerate = async () => {
		setError('')
		setTour(null)
		setLoading(true)
		try {
			const result = await generateTour(places, theme, {
				count,
				selectedIds,
			})
			setTour(result)
			if (result.stops[0]) {
				setActiveId(result.stops[0].place.id)
				mapRef.current?.flyTo([result.stops[0].place.lat, result.stops[0].place.lng], 14, {
					duration: 1,
				})
			}
		} catch (e) {
			console.error(e)
			setError(e.message || 'Ошибка генерации')
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
						Сколько объектов в экскурсии
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

					<div className={styles.selectHint}>
						Отметьте места, которые обязательно должны быть в экскурсии (выбрано:{' '}
						{selectedIds.length})
					</div>

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

					<button onClick={handleGenerate} disabled={loading} className={styles.buildBtn}>
						{loading ? '🧠 Нейросеть пишет тексты...' : '✨ Сгенерировать экскурсию'}
					</button>

					{loading && (
						<p className={styles.loadingHint}>
							Это займёт 30-60 секунд — генерируем тексты на 4 минуты для каждой точки.
						</p>
					)}
				</>
			)}

			{error && <p className={styles.tourError}>{error}</p>}

			{tour && (
				<>
					<div className={styles.tourHeader}>
						<h4>{tour.title}</h4>
						{tour.intro && <p className={styles.tourIntro}>{tour.intro}</p>}
					</div>

					<ol className={styles.tourList}>
						{tour.stops.map((stop, i) => (
							<li key={stop.place.id} className={styles.tourItem}>
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

								{stop.script && (
									<details className={styles.tourScript}>
										<summary>📖 Показать текст для экскурсовода</summary>
										<p>{stop.script}</p>
									</details>
								)}
							</li>
						))}
					</ol>

					{tour.outro && <p className={styles.tourOutro}>{tour.outro}</p>}

					<div className={styles.tourActions}>
						<button onClick={handleDownload} disabled={exporting} className={styles.downloadBtn}>
							{exporting ? '⏳ Готовим файл...' : '📄 Скачать .docx'}
						</button>

						<button onClick={() => setTour(null)} className={styles.resetBtn}>
							Сбросить
						</button>
					</div>
				</>
			)}
		</>
	)
}
