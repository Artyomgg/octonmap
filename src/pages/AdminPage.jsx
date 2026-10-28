import { Check, Edit3, MapPin, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import EditPlaceModal from '../components/Admin/EditPlaceModal'
import { useAuth } from '../context/AuthContext'
import styles from '../css/Admin.module.css'
import {
	fetchAllProfiles,
	fetchAllProposals,
	setUserRole,
	updateProposalStatus,
} from '../lib/admins'
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
					className={tab === 'proposals' ? styles.tabActive : styles.tab}
					onClick={() => setTab('proposals')}
				>
					Маршруты гидов
				</button>
				<button
					className={tab === 'users' ? styles.tabActive : styles.tab}
					onClick={() => setTab('users')}
				>
					Пользователи
				</button>
			</div>

			{tab === 'places' && <PlacesTab />}
			{tab === 'proposals' && <ProposalsTab />}
			{tab === 'users' && <UsersTab currentUserId={user.id} />}
		</div>
	)
}

function PlacesTab() {
	const [places, setPlaces] = useState([])
	const [loading, setLoading] = useState(true)
	const [filter, setFilter] = useState('all')
	const [editing, setEditing] = useState(null)

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
		if (!confirm(`Удалить место «${title}»?`)) return
		try {
			await deletePlace(id)
			setPlaces(prev => prev.filter(p => p.id !== id))
		} catch (e) {
			alert('Ошибка: ' + e.message)
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
				<p>Ничего нет.</p>
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
								{p.base_script && (
									<p style={{ color: '#1a7a3a', fontSize: '12px', margin: '4px 0' }}>
										✓ Есть текст экскурсии
									</p>
								)}
							</div>
							<div className={styles.actions}>
								{p.status !== 'approved' && (
									<button className={styles.approve} onClick={() => moderate(p.id, 'approved')}>
										<Check size={14} /> Одобрить
									</button>
								)}
								{p.status !== 'rejected' && (
									<button className={styles.reject} onClick={() => moderate(p.id, 'rejected')}>
										<X size={14} /> Отклонить
									</button>
								)}
								<button className={styles.edit} onClick={() => setEditing(p)}>
									<Edit3 size={14} /> Изменить
								</button>
								<button className={styles.delete} onClick={() => remove(p.id, p.title)}>
									<Trash2 size={14} /> Удалить
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

function ProposalsTab() {
	const [proposals, setProposals] = useState([])
	const [places, setPlaces] = useState([])
	const [loading, setLoading] = useState(true)

	const load = async () => {
		setLoading(true)
		try {
			const [proposalsData, placesData] = await Promise.all([fetchAllProposals(), fetchAllPlaces()])
			setProposals(proposalsData)
			setPlaces(placesData)
		} catch (error) {
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		load()
	}, [])

	const moderate = async (id, status) => {
		try {
			await updateProposalStatus(id, status)
			setProposals(prev => prev.map(p => (p.id === id ? { ...p, status } : p)))
		} catch (e) {
			alert('Ошибка: ' + e.message)
		}
	}

	if (loading) return <p>Загрузка...</p>
	if (proposals.length === 0) return <p>Пока нет предложенных маршрутов.</p>

	return (
		<div className={styles.grid}>
			{proposals.map(prop => {
				const propPlaces = prop.route_ids.map(id => places.find(p => p.id === id)).filter(Boolean)

				return (
					<div key={prop.id} className={styles.card} style={{ height: 'auto' }}>
						<div className={styles.cardBody}>
							<div className={styles.meta}>
								<span className={`${styles.status} ${styles[prop.status]}`}>
									{STATUS_LABEL[prop.status] || prop.status}
								</span>
								<span className={styles.addr}>Автор: {prop.author_id?.slice(0, 8)}...</span>
							</div>

							<h3 style={{ marginTop: '10px' }}>{prop.title}</h3>
							{prop.description && <p className={styles.desc}>{prop.description}</p>}

							<div
								style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
							>
								{propPlaces.map(p => {
									const customText = prop.custom_scripts?.[p.id]
									return (
										<div
											key={p.id}
											style={{
												background: '#f9fafc',
												padding: '12px',
												borderRadius: '8px',
												border: '1px solid #eef1f7',
											}}
										>
											<strong
												style={{
													fontSize: '14px',
													display: 'flex',
													alignItems: 'center',
													gap: '6px',
													color: '#1b2a4a',
												}}
											>
												<MapPin size={16} color='#2a4a8a' /> {p.title}
											</strong>
											{customText ? (
												<div style={{ marginTop: '8px' }}>
													<span
														style={{
															fontSize: '11px',
															fontWeight: 600,
															color: '#8a6500',
															background: '#fff3cd',
															padding: '2px 6px',
															borderRadius: '4px',
														}}
													>
														Альтернативный текст
													</span>
													<p
														style={{
															margin: '6px 0 0',
															fontSize: '13px',
															color: '#4a5e85',
															lineHeight: '1.5',
														}}
													>
														"{customText}"
													</p>
												</div>
											) : (
												<p
													style={{
														margin: '6px 0 0',
														fontSize: '12px',
														color: '#6b7a99',
														fontStyle: 'italic',
													}}
												>
													Используется базовый текст.
												</p>
											)}
										</div>
									)
								})}
							</div>
						</div>

						<div className={styles.actions}>
							{prop.status !== 'approved' && (
								<button className={styles.approve} onClick={() => moderate(prop.id, 'approved')}>
									<Check size={14} /> Одобрить
								</button>
							)}
							{prop.status !== 'rejected' && (
								<button className={styles.reject} onClick={() => moderate(prop.id, 'rejected')}>
									<X size={14} /> Отклонить
								</button>
							)}
						</div>
					</div>
				)
			})}
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
		if (!confirm(`Сделать ${p.email} ${newRole === 'admin' ? 'админом' : 'обычным'}?`)) return
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
			<div className={styles.tableWrap}>
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
			</div>
		</>
	)
}
