import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import MapView from '../components/Map/MapView'
import styles from '../css/MapPage.module.css'
import { fetchApprovedPlaces } from '../lib/places'

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

export default function MapPage() {
	const [places, setPlaces] = useState([])
	const [loading, setLoading] = useState(true)
	const [category, setCategory] = useState('all')
	const [query, setQuery] = useState('')
	const [activeId, setActiveId] = useState(null)
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
			!q ||
			p.title?.toLowerCase().includes(q) ||
			p.address?.toLowerCase().includes(q) ||
			p.description?.toLowerCase().includes(q)
		return matchesCategory && matchesQuery
	})

	const handleSelect = place => {
		setActiveId(place.id)
		mapRef.current?.flyTo([place.lat, place.lng], 17, { duration: 0.8 })
	}

	return (
		<div className={styles.layout}>
			<aside className={styles.sidebar}>
				<h2>Памятные места</h2>

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
					Найдено: <strong>{filtered.length}</strong>
				</div>

				{loading ? (
					<p>Загрузка...</p>
				) : filtered.length === 0 ? (
					<p className={styles.empty}>Ничего не найдено</p>
				) : (
					<ul className={styles.list}>
						{filtered.map(p => (
							<li
								key={p.id}
								className={`${styles.item} ${activeId === p.id ? styles.itemActive : ''}`}
							>
								<button onClick={() => handleSelect(p)} className={styles.itemBtn}>
									<strong>{p.title}</strong>
									<span className={styles.cat}>{p.category}</span>
									{p.address && <span className={styles.addr}>{p.address}</span>}
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
			</aside>

			<div className={styles.mapArea}>
				<MapView
					places={filtered}
					mapRef={mapRef}
					activeId={activeId}
					onMarkerClick={place => setActiveId(place.id)}
				/>
			</div>
		</div>
	)
}
