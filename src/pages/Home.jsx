import { Edit3, Map, Sparkles } from 'lucide-react'
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
						Интерактивный гид с искусственным интеллектом. Исследуйте историю, добавляйте
						неизвестные памятники и создавайте готовые экскурсии в один клик.
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
					<div className={styles.iconWrap}>
						<Map size={32} />
					</div>
					<h3>Интерактивная карта</h3>
					<p>
						Все значимые места района на одной карте. Фильтруйте по категориям, находите ближайшие к
						дому.
					</p>
				</div>
				<div className={styles.feature}>
					<div className={styles.iconWrap}>
						<Edit3 size={32} />
					</div>
					<h3>Народный архив</h3>
					<p>
						Любой житель может добавить место, которого нет в базе. Модератор проверит — и точка
						появится на карте.
					</p>
				</div>
				<div className={styles.feature}>
					<div className={styles.iconWrap}>
						<Sparkles size={32} />
					</div>
					<h3>Экскурсии от ИИ</h3>
					<p>
						Нейросеть составит маршрут и напишет готовый текст для экскурсовода на основе выбранных
						вами мест.
					</p>
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
					<strong>AI</strong>
					<span>генерация текстов</span>
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
