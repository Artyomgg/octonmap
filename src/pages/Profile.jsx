import { BookOpen, Edit3, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'
import styles from '../css/Profile.module.css'
import { fetchMyPlaces } from '../lib/places'
import { supabase } from '../lib/supabase'

const STATUS_LABEL = {
	pending: 'На модерации',
	approved: 'Опубликовано',
	rejected: 'Отклонено',
}

export default function Profile() {
	const { user, isAdmin } = useAuth()
	const [places, setPlaces] = useState([])
	const [tours, setTours] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!user) return

		const loadData = async () => {
			try {
				// Загружаем места
				const myPlaces = await fetchMyPlaces(user.id)
				setPlaces(myPlaces)

				// Загружаем маршруты
				const { data: myTours } = await supabase
					.from('tour_proposals')
					.select('*')
					.eq('author_id', user.id)
					.order('created_at', { ascending: false })

				setTours(myTours || [])
			} catch (e) {
				console.error(e)
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [user])

	return (
		<div className={styles.page}>
			<h1>Мой профиль</h1>
			<p className={styles.email}>{user?.email}</p>

			{isAdmin && (
				<Link to='/admin' className={styles.adminCard}>
					<div>
						<strong>⚙ Админ-панель</strong>
						<span>Модерация и управление</span>
					</div>
					<span className={styles.arrow}>→</span>
				</Link>
			)}

			{/* 🔥 БЛОК С МАРШРУТАМИ */}
			<div className={styles.section}>
				<div className={styles.sectionHeader}>
					<h2>
						<BookOpen size={20} /> Мои экскурсии
					</h2>
					<Link to='/guide-lab' className={styles.addBtn}>
						+ Создать маршрут
					</Link>
				</div>

				{loading ? (
					<p>Загрузка...</p>
				) : tours.length === 0 ? (
					<p className={styles.empty}>Вы еще не создавали маршрутов.</p>
				) : (
					<ul className={styles.list}>
						{tours.map(t => (
							<li key={t.id} className={styles.item}>
								<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
									<strong style={{ fontSize: '15px' }}>{t.title}</strong>
									<span style={{ fontSize: '12px', color: '#6b7a99' }}>
										{t.route_ids.length} точек
									</span>
								</div>
								<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
									<span className={`${styles.status} ${styles[t.status]}`}>
										{STATUS_LABEL[t.status]}
									</span>
									<Link to={`/edit-tour/${t.id}`} className={styles.editLink} title='Редактировать'>
										<Edit3 size={18} />
									</Link>
								</div>
							</li>
						))}
					</ul>
				)}
			</div>

			{/* БЛОК С МЕСТАМИ */}
			<div className={styles.section} style={{ marginTop: '30px' }}>
				<div className={styles.sectionHeader}>
					<h2>
						<MapPin size={20} /> Мои места
					</h2>
					<Link to='/add' className={styles.addBtn}>
						+ Добавить
					</Link>
				</div>

				{loading ? (
					<p>Загрузка...</p>
				) : places.length === 0 ? (
					<p className={styles.empty}>Вы еще ничего не добавляли.</p>
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
		</div>
	)
}
