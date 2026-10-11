import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import MapView from '../components/Map/MapView'
import styles from '../css/MapPage.module.css'
import { fetchApprovedPlaces } from '../lib/places'

export default function MapPage() {
	const [places, setPlaces] = useState([])
	const [loading, setLoading] = useState(true)
	const [category, setCategory] = useState('all')

	useEffect(() => {
		fetchApprovedPlaces()
			.then(setPlaces)
			.catch(e => console.error(e))
			.finally(() => setLoading(false))
	}, [])

	const filtered = category === 'all' ? places : places.filter(p => p.category === category)

	return (
		<div className={styles.layout}>
			<aside className={styles.sidebar}>
				<h2>Памятные места</h2>

				<select
					value={category}
					onChange={e => setCategory(e.target.value)}
					className={styles.select}
				>
					<option value='all'>Все категории</option>
					<option value='памятник'>Памятники</option>
					<option value='доска'>Мемориальные доски</option>
					<option value='могила'>Братские могилы</option>
					<option value='улица'>Улицы</option>
				</select>

				{loading ? (
					<p>Загрузка...</p>
				) : filtered.length === 0 ? (
					<p className={styles.empty}>Пока ничего нет</p>
				) : (
					<ul className={styles.list}>
						{filtered.map(p => (
							<li key={p.id} className={styles.item}>
								<Link to={`/place/${p.id}`}>
									<strong>{p.title}</strong>
									<span>{p.address}</span>
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
				<MapView places={filtered} />
			</div>
		</div>
	)
}
