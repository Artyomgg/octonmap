import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import styles from '../../css/Header.module.css'

export default function Header() {
	const { user, signOut } = useAuth()
	const navigate = useNavigate()

	const handleLogout = async () => {
		await signOut()
		navigate('/')
	}

	return (
		<header className={styles.header}>
			<Link to='/' className={styles.logo}>
				🇧🇾 Октябрьский — Помним
			</Link>

			<nav className={styles.nav}>
				<NavLink to='/' className={({ isActive }) => (isActive ? styles.active : '')}>
					Главная
				</NavLink>
				<NavLink to='/map' className={({ isActive }) => (isActive ? styles.active : '')}>
					Карта
				</NavLink>
				{user && (
					<>
						<NavLink to='/add' className={({ isActive }) => (isActive ? styles.active : '')}>
							Добавить место
						</NavLink>
						<NavLink to='/profile' className={({ isActive }) => (isActive ? styles.active : '')}>
							Профиль
						</NavLink>
					</>
				)}
			</nav>

			<div className={styles.auth}>
				{user ? (
					<>
						<span className={styles.email}>{user.email}</span>
						<button onClick={handleLogout} className={styles.btn}>
							Выйти
						</button>
					</>
				) : (
					<>
						<Link to='/login' className={styles.btn}>
							Вход
						</Link>
						<Link to='/register' className={styles.btnPrimary}>
							Регистрация
						</Link>
					</>
				)}
			</div>
		</header>
	)
}
