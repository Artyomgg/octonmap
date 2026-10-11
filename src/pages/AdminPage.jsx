import { useEffect, useState } from 'react'
import EditPlaceModal from '../components/Admin/EditPlaceModal'
import { useAuth } from '../context/AuthContext'
import styles from '../css/Admin.module.css'
import { fetchAllProfiles, setUserRole } from '../lib/admins'
import { deletePlace, fetchAllPlaces, updatePlaceStatus } from '../lib/places'

const STATUS_LABEL = {
	pending: 'На модерации',
	approved: 'Опубликовано',
	rejected: 'Отклонено',
}

export default function AdminPage() {
	const { user } = useAuth()
	const [tab, setTab] = useState('places')

	return (
		<div className={styles.page}>
			<h1>Админ-панель</h1>

			<div className={styles.tabs}>
				<button
					className={tab === 'places' ? styles.tabActive : styles.tab}
					onClick={() => setTab('places')}
				>
					Места
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
	const [filter, setFilter] = useState('all')
	const [editing, setEditing] = useState(null) // место, которое редактируем

	const load = () => {
		setLoading(true)
		fetchAllPlaces()
			.then(setPlaces)
			.catch(console.error)
			.finally(() => setLoading(false))
	}

	useEffect(load, [])

	const filtered = filter === 'all' ? places : places.filter(p => p.status === filter)

	const moderate = async (id, status) => {
		await updatePlaceStatus(id, status)
		setPlaces(prev => prev.map(p => (p.id === id ? { ...p, status } : p)))
	}

	const remove = async (id, title) => {
		if (!confirm(`Удалить место «${title}»? Действие необратимо.`)) return
		try {
			await deletePlace(id)
			setPlaces(prev => prev.filter(p => p.id !== id))
		} catch (e) {
			alert('Ошибка удаления: ' + e.message)
		}
	}

	if (loading) return <p>Загрузка...</p>

	return (
		<>
			<div className={styles.filters}>
				{['all', 'pending', 'approved', 'rejected'].map(s => (
					<button
						key={s}
						className={filter === s ? styles.filterActive : styles.filter}
						onClick={() => setFilter(s)}
					>
						{s === 'all' ? 'Все' : STATUS_LABEL[s]}
						<span className={styles.count}>
							{s === 'all' ? places.length : places.filter(p => p.status === s).length}
						</span>
					</button>
				))}
			</div>

			{filtered.length === 0 ? (
				<p>Ничего нет в этой категории</p>
			) : (
				<div className={styles.grid}>
					{filtered.map(p => (
						<div key={p.id} className={styles.card}>
							{p.photo_url ? (
								<img src={p.photo_url} alt={p.title} />
							) : (
								<div className={styles.noPhoto}>Нет фото</div>
							)}

							<div className={styles.cardBody}>
								<h3>{p.title}</h3>
								<div className={styles.meta}>
									<span className={styles.category}>{p.category}</span>
									<span className={`${styles.status} ${styles[p.status]}`}>
										{STATUS_LABEL[p.status]}
									</span>
								</div>
								{p.address && <p className={styles.addr}>{p.address}</p>}
								{p.description && <p className={styles.desc}>{p.description}</p>}
							</div>

							<div className={styles.actions}>
								{p.status !== 'approved' && (
									<button className={styles.approve} onClick={() => moderate(p.id, 'approved')}>
										✓ Одобрить
									</button>
								)}
								{p.status !== 'rejected' && (
									<button className={styles.reject} onClick={() => moderate(p.id, 'rejected')}>
										✕ Отклонить
									</button>
								)}
								<button className={styles.edit} onClick={() => setEditing(p)}>
									✎ Изменить
								</button>
								<button className={styles.delete} onClick={() => remove(p.id, p.title)}>
									🗑 Удалить
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{editing && (
				<EditPlaceModal place={editing} onClose={() => setEditing(null)} onSaved={load} />
			)}
		</>
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
