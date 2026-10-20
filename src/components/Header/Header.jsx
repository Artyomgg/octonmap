import { Settings } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import styles from '../../css/Header.module.css'

export default function Header() {
	const { user, isAdmin, signOut } = useAuth()
	const navigate = useNavigate()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	const handleLogout = async () => {
		await signOut()
		setIsMobileMenuOpen(false)
		navigate('/')
	}

	const closeMenu = () => setIsMobileMenuOpen(false)

	return (
		<>
			<header className={styles.header}>
				<Link to='/' className={styles.logo} onClick={closeMenu}>
					<img src='/img/favicon.png' alt='' className={styles.logoIcon} />
					<span>Октябрьский — Помним</span>
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

					{isAdmin && (
						<NavLink
							to='/admin'
							className={({ isActive }) => `${styles.adminLink} ${isActive ? styles.active : ''}`}
						>
							<Settings size={16} />
							<span>Админка</span>
						</NavLink>
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

				<button
					className={styles.burgerBtn}
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					aria-label='Меню'
				>
					<div className={`${styles.burgerIcon} ${isMobileMenuOpen ? styles.burgerIconOpen : ''}`}>
						<span></span>
						<span></span>
						<span></span>
					</div>
				</button>
			</header>

			<div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
				<nav className={styles.mobileNav}>
					<NavLink
						to='/'
						onClick={closeMenu}
						className={({ isActive }) => (isActive ? styles.mobileActive : styles.mobileLink)}
					>
						Главная
					</NavLink>
					<NavLink
						to='/map'
						onClick={closeMenu}
						className={({ isActive }) => (isActive ? styles.mobileActive : styles.mobileLink)}
					>
						Карта
					</NavLink>

					{user && (
						<>
							<NavLink
								to='/add'
								onClick={closeMenu}
								className={({ isActive }) => (isActive ? styles.mobileActive : styles.mobileLink)}
							>
								Добавить место
							</NavLink>
							<NavLink
								to='/profile'
								onClick={closeMenu}
								className={({ isActive }) => (isActive ? styles.mobileActive : styles.mobileLink)}
							>
								Профиль
							</NavLink>
						</>
					)}

					{isAdmin && (
						<NavLink
							to='/admin'
							onClick={closeMenu}
							className={({ isActive }) => (isActive ? styles.mobileActive : styles.mobileLink)}
						>
							<Settings size={18} style={{ marginRight: '8px' }} />
							Админка
						</NavLink>
					)}
				</nav>

				<div className={styles.mobileAuth}>
					{user ? (
						<>
							<span className={styles.mobileEmail}>{user.email}</span>
							<button onClick={handleLogout} className={styles.mobileBtn}>
								Выйти
							</button>
						</>
					) : (
						<div className={styles.mobileAuthButtons}>
							<Link to='/login' onClick={closeMenu} className={styles.mobileBtn}>
								Вход
							</Link>
							<Link to='/register' onClick={closeMenu} className={styles.mobileBtnPrimary}>
								Регистрация
							</Link>
						</div>
					)}
				</div>
			</div>

			{isMobileMenuOpen && <div className={styles.overlay} onClick={closeMenu}></div>}
		</>
	)
}
