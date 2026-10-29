import { Edit3, X } from 'lucide-react'
import { useNavigate } from 'react-router' // 🔥 Импорт для перехода
import styles from '../../css/Modal.module.css'

export default function ViewProposalModal({ proposal, places, onClose }) {
	const navigate = useNavigate() // 🔥 Хук для навигации

	if (!proposal) return null

	const propPlaces = proposal.route_ids.map(id => places.find(p => p.id === id)).filter(Boolean)
	const customScripts = proposal.custom_scripts || {}

	return (
		<div className={styles.overlay} onClick={onClose}>
			<div
				className={styles.modal}
				onClick={e => e.stopPropagation()}
				style={{ maxWidth: '800px' }}
			>
				<div className={styles.modalHeader}>
					<div>
						<h2>{proposal.title}</h2>
						<span style={{ fontSize: '13px', color: '#6b7a99' }}>{proposal.description}</span>
					</div>

					{/* 🔥 БЛОК С КНОПКАМИ В ШАПКЕ МОДАЛКИ */}
					<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
						<button
							onClick={() => navigate(`/edit-tour/${proposal.id}`)}
							className={styles.closeBtn}
							title='Редактировать маршрут'
							style={{ color: '#2a4a8a', background: '#eef1f7' }} // Выделяем кнопку
						>
							<Edit3 size={20} />
						</button>
						<button className={styles.closeBtn} onClick={onClose} title='Закрыть'>
							<X size={20} />
						</button>
					</div>
				</div>

				<div className={styles.form} style={{ padding: '20px 28px' }}>
					<h3 style={{ marginBottom: '16px', color: '#1b2a4a', fontSize: '18px' }}>
						Точки маршрута:
					</h3>

					<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
						{propPlaces.map((p, i) => {
							const script = customScripts[p.id] || p.base_script
							return (
								<div
									key={p.id}
									style={{
										background: '#f9fafc',
										padding: '16px',
										borderRadius: '10px',
										border: '1px solid #e0e6f0',
									}}
								>
									<div
										style={{
											display: 'flex',
											gap: '12px',
											alignItems: 'flex-start',
											marginBottom: '12px',
										}}
									>
										<span
											style={{
												background: '#1b2a4a',
												color: '#ffcc00',
												width: '24px',
												height: '24px',
												borderRadius: '50%',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												fontSize: '12px',
												fontWeight: 'bold',
												flexShrink: 0,
											}}
										>
											{i + 1}
										</span>
										<div>
											<strong style={{ display: 'block', fontSize: '16px', color: '#1b2a4a' }}>
												{p.title}
											</strong>
											<span style={{ fontSize: '12px', color: '#6b7a99' }}>{p.address}</span>
										</div>
									</div>
									{script ? (
										<div
											style={{
												background: '#fff',
												padding: '12px',
												borderRadius: '8px',
												borderLeft: '3px solid #2a4a8a',
											}}
										>
											<p
												style={{
													margin: 0,
													fontSize: '14px',
													lineHeight: 1.6,
													color: '#4a5e85',
													whiteSpace: 'pre-line',
												}}
											>
												{script}
											</p>
										</div>
									) : (
										<p style={{ fontSize: '12px', color: '#a30000', margin: 0 }}>
											Текст не добавлен
										</p>
									)}
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	)
}
