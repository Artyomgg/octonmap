import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from '../css/Admin.module.css'
import { fetchAllProfiles, setUserRole } from '../lib/admins'
import { fetchPendingPlaces, updatePlaceStatus } from '../lib/places'

export default function AdminPage() {
	const { user } = useAuth()
	const [tab, setTab] = useState('places') // 'places' | 'users'

	return (
		<div className={styles.page}>
			<h1>Админ-панель</h1>

			<div className={styles.tabs}>
				<button
					className={tab === 'places' ? styles.tabActive : styles.tab}
					onClick={() => setTab('places')}
				>
					Модерация мест
				</button>
				<button
					className={tab === 'users' ? styles.tabActive : styles.tab}
					onClick={() => setTab('users')}
				>
					Пользователи
				</button>
			</div>

			{tab === 'places' ? <PlacesTab /> : <UsersTab currentUserId={user.id} />}
		</div>
	)
}

function PlacesTab() {
	const [places, setPlaces] = useState([])
	const [loading, setLoading] = useState(true)

	const load = () => {
		setLoading(true)
		fetchPendingPlaces()
			.then(setPlaces)
			.catch(console.error)
			.finally(() => setLoading(false))
	}

	useEffect(load, [])

	const moderate = async (id, status) => {
		await updatePlaceStatus(id, status)
		setPlaces(prev => prev.filter(p => p.id !== id))
	}

	if (loading) return <p>Загрузка...</p>
	if (places.length === 0) return <p>Нет мест на модерации 🎉</p>

	return (
		<div className={styles.grid}>
			{places.map(p => (
				<div key={p.id} className={styles.card}>
					{p.photo_url && <img src={p.photo_url} alt={p.title} />}
					<h3>{p.title}</h3>
					<span className={styles.category}>{p.category}</span>
					<p className={styles.addr}>{p.address}</p>
					<p className={styles.desc}>{p.description}</p>

					<div className={styles.actions}>
						<button className={styles.approve} onClick={() => moderate(p.id, 'approved')}>
							✓ Одобрить
						</button>
						<button className={styles.reject} onClick={() => moderate(p.id, 'rejected')}>
							✕ Отклонить
						</button>
					</div>
				</div>
			))}
		</div>
	)
}

function UsersTab({ currentUserId }) {
	const [profiles, setProfiles] = useState([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState('')

	useEffect(() => {
		fetchAllProfiles()
			.then(setProfiles)
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [])

	const toggleRole = async p => {
		const newRole = p.role === 'admin' ? 'user' : 'admin'
		if (
			!confirm(`Сделать ${p.email} ${newRole === 'admin' ? 'админом' : 'обычным пользователем'}?`)
		)
			return

		try {
			await setUserRole(p.id, newRole)
			setProfiles(prev => prev.map(u => (u.id === p.id ? { ...u, role: newRole } : u)))
		} catch (e) {
			alert('Ошибка: ' + e.message)
		}
	}

	if (loading) return <p>Загрузка...</p>

	const filtered = profiles.filter(p => p.email?.toLowerCase().includes(search.toLowerCase()))

	return (
		<>
			<input
				className={styles.search}
				placeholder='Поиск по email...'
				value={search}
				onChange={e => setSearch(e.target.value)}
			/>

			<table className={styles.table}>
				<thead>
					<tr>
						<th>Email</th>
						<th>Имя</th>
						<th>Роль</th>
						<th>Действие</th>
					</tr>
				</thead>
				<tbody>
					{filtered.map(p => (
						<tr key={p.id}>
							<td>{p.email}</td>
							<td>{p.full_name || '—'}</td>
							<td>
								<span className={p.role === 'admin' ? styles.roleAdmin : styles.roleUser}>
									{p.role === 'admin' ? 'Админ' : 'Пользователь'}
								</span>
							</td>
							<td>
								{p.id === currentUserId ? (
									<span className={styles.self}>Это вы</span>
								) : (
									<button
										className={p.role === 'admin' ? styles.reject : styles.approve}
										onClick={() => toggleRole(p)}
									>
										{p.role === 'admin' ? 'Снять админа' : 'Сделать админом'}
									</button>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	)
}
