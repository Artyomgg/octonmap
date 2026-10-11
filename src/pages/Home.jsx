import { Link } from 'react-router'
import styles from '../css/Home.module.css'

export default function Home() {
	return (
		<div className={styles.page}>
			<section className={styles.hero}>
				<div className={styles.heroContent}>
					<span className={styles.badge}>Октябрьский район · Минск</span>
					<h1>
						Карта памяти <br />
						<span className={styles.accent}>Октябрьского района</span>
					</h1>
					<p className={styles.lead}>
						Интерактивная карта памятников, исторических мест, архитектуры и достопримечательностей
						района. Добавляйте места, которых нет в официальных реестрах, и сохраняйте историю
						вместе.
					</p>
					<div className={styles.actions}>
						<Link to='/map' className={styles.btnPrimary}>
							Открыть карту →
						</Link>
						<Link to='/add' className={styles.btnGhost}>
							Добавить место
						</Link>
					</div>
				</div>
			</section>

			<section className={styles.features}>
				<div className={styles.feature}>
					<span className={styles.icon}>🗺</span>
					<h3>Интерактивная карта</h3>
					<p>
						Все значимые места района на одной карте. Фильтруйте по категориям, находите ближайшие к
						дому.
					</p>
				</div>
				<div className={styles.feature}>
					<span className={styles.icon}>✍️</span>
					<h3>Народный архив</h3>
					<p>
						Любой житель может добавить место, которого нет в базе. Модератор проверит — и точка
						появится на карте.
					</p>
				</div>
				<div className={styles.feature}>
					<span className={styles.icon}>🏛</span>
					<h3>История и культура</h3>
					<p>Памятники, архитектура, мемориалы, скверы и знаковые места — всё в одном месте.</p>
				</div>
			</section>

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
					<span>память</span>
				</div>
			</section>

			<section className={styles.cta}>
				<h2>Знаете место, которого нет на карте?</h2>
				<p>Добавьте его — и оно станет частью общей истории района.</p>
				<Link to='/add' className={styles.btnPrimary}>
					Добавить место
				</Link>
			</section>
		</div>
	)
}
