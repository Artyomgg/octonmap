import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'
import styles from '../css/Profile.module.css'
import { fetchMyPlaces } from '../lib/places'

const STATUS_LABEL = {
	pending: 'На модерации',
	approved: 'Опубликовано',
	rejected: 'Отклонено',
}

export default function Profile() {
	const { user } = useAuth()
	const [places, setPlaces] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!user) return
		fetchMyPlaces(user.id)
			.then(setPlaces)
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [user])

	return (
		<div className={styles.page}>
			<h1>Мои добавленные места</h1>

			<Link to='/add' className={styles.addBtn}>
				+ Добавить ещё
			</Link>

			{loading ? (
				<p>Загрузка...</p>
			) : places.length === 0 ? (
				<p>Вы ещё ничего не добавляли</p>
			) : (
				<ul className={styles.list}>
					{places.map(p => (
						<li key={p.id} className={styles.item}>
							<Link to={`/place/${p.id}`}>{p.title}</Link>
							<span className={`${styles.status} ${styles[p.status]}`}>
								{STATUS_LABEL[p.status]}
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
