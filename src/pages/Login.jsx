import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import styles from '../css/Auth.module.css'

export default function Login() {
	const { signIn } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()
	const from = location.state?.from?.pathname || '/map'

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async e => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			const { error } = await signIn(email, password)
			if (error) throw error
			navigate(from, { replace: true })
		} catch (e) {
			setError(e.message || 'Ошибка входа')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className={styles.wrapper}>
			<form className={styles.card} onSubmit={handleSubmit}>
				<h1>Вход</h1>
				<p className={styles.subtitle}>Войдите, чтобы добавлять памятные места</p>

				{error && <div className={styles.error}>{error}</div>}

				<label>
					Email
					<input
						type='email'
						value={email}
						onChange={e => setEmail(e.target.value)}
						placeholder='you@example.com'
						required
						autoComplete='email'
					/>
				</label>

				<label>
					Пароль
					<input
						type='password'
						value={password}
						onChange={e => setPassword(e.target.value)}
						placeholder='••••••••'
						required
						autoComplete='current-password'
					/>
				</label>

				<button type='submit' disabled={loading} className={styles.submit}>
					{loading ? 'Вход...' : 'Войти'}
				</button>

				<p className={styles.switch}>
					Нет аккаунта? <Link to='/register'>Зарегистрироваться</Link>
				</p>
			</form>
		</div>
	)
}
