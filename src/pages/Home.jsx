import { BookOpen, Edit3, Map } from 'lucide-react'
import { Link } from 'react-router'
import styles from '../css/Home.module.css'

export default function Home() {
	return (
		<div className={styles.page}>
			{/* Главный экран */}
			<section className={styles.hero}>
				<div className={styles.heroContent}>
					<span className={styles.badge}>Октябрьский район · Минск</span>
					<h1>
						Карта памяти <br />
						<span className={styles.accent}>Октябрьского района</span>
					</h1>
					<p className={styles.lead}>
						Интерактивный гид по истории нашего района. Платформа, которая создается самими
						жителями: учителями, экскурсоводами и неравнодушными людьми.
					</p>
					<div className={styles.actions}>
						<Link to='/map' className={styles.btnPrimary}>
							Открыть карту →
						</Link>
						<Link to='/tours' className={styles.btnGhost}>
							Готовые маршруты
						</Link>
					</div>
				</div>
			</section>

			{/* Блок с фишками */}
			<section className={styles.features}>
				<div className={styles.feature}>
					<div className={styles.iconWrap}>
						<Map size={28} />
					</div>
					<h3>Интерактивная карта</h3>
					<p>
						Все значимые места района на одной карте. Фильтруйте по категориям (от архитектуры до
						мемориалов) и находите ближайшие к дому точки.
					</p>
				</div>
				<div className={styles.feature}>
					<div className={styles.iconWrap}>
						<Edit3 size={28} />
					</div>
					<h3>Народный архив</h3>
					<p>
						Знаете забытый памятник или мемориальную доску? Добавьте её на карту. После проверки
						модератором точка станет частью общей истории.
					</p>
				</div>
				<div className={styles.feature}>
					<div className={styles.iconWrap}>
						<BookOpen size={28} />
					</div>
					<h3>Лаборатория гидов</h3>
					<p>
						Экскурсоводы и учителя создают авторские маршруты с уникальными текстами. Вы можете
						найти готовый маршрут или создать свой.
					</p>
				</div>
			</section>

			{/* Блок со статистикой */}
			<section className={styles.stats}>
				<div>
					<strong>80+</strong>
					<span>лет истории</span>
				</div>
				<div>
					<strong>10+</strong>
					<span>категорий мест</span>
				</div>
				<div>
					<strong>∞</strong>
					<span>авторских маршрутов</span>
				</div>
			</section>

			{/* Призыв к действию */}
			<section className={styles.cta}>
				<h2>Сохраним историю вместе</h2>
				<p>
					Поделитесь своими знаниями о районе — создайте маршрут или добавьте забытое место. Вместе
					мы делаем историю живой.
				</p>
				<div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
					<Link to='/guide-lab' className={styles.btnPrimary}>
						Предложить маршрут
					</Link>
					<Link
						to='/map'
						className={styles.btnGhost}
						style={{ borderColor: '#fff', color: '#fff' }}
					>
						Посмотреть карту
					</Link>
				</div>
			</section>
		</div>
	)
}
