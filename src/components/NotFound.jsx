import { Link } from 'react-router'
import styles from '../css/NotFound.module.css'

export default function NotFound() {
	return (
		<div className={styles.page}>
			<h1>404</h1>
			<p>Такой страницы не существует</p>
			<Link to='/' className={styles.btn}>
				← На главную
			</Link>
		</div>
	)
}
