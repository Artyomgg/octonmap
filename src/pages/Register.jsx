import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import styles from '../css/Auth.module.css';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('Пароль должен быть не менее 6 символов');
    }
    if (password !== confirm) {
      return setError('Пароли не совпадают');
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) throw error;
      setSuccess(true);
      // Если в Supabase отключено подтверждение email — сразу редирект
      setTimeout(() => navigate('/map'), 1500);
    } catch (e) {
      setError(e.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1>✓ Готово!</h1>
          <p className={styles.subtitle}>
            Аккаунт создан. Перенаправляем на карту...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1>Регистрация</h1>
        <p className={styles.subtitle}>
          Создайте аккаунт, чтобы добавлять места на карту
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </label>

        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="минимум 6 символов"
            required
            autoComplete="new-password"
          />
        </label>

        <label>
          Повторите пароль
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
        </label>

        <button type="submit" disabled={loading} className={styles.submit}>
          {loading ? 'Создание...' : 'Зарегистрироваться'}
        </button>

        <p className={styles.switch}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
}