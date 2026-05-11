import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Auth.css';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);

  async function onSubmit(e) {
    e.preventDefault();
    setErrors([]);
    try {
      await register({ username, email, password });
      navigate('/login', { replace: true });
    } catch (err) {
      const list = err.response?.data?.errors;
      if (Array.isArray(list)) {
        setErrors(list.map((x) => x.msg || x.message || String(x)));
      } else {
        setErrors([err.response?.data?.message || 'Registration failed']);
      }
    }
  }

  return (
    <div className="auth-page">
      <Link to="/" className="auth-logo">
        <span className="auth-logo__play" />
        YouTube Clone
      </Link>
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Create account</h1>
        <p className="auth-lead">Join to upload and manage your channel.</p>
        {errors.length > 0 && (
          <ul className="auth-error-list">
            {errors.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
        <label className="auth-label">
          Username
          <input
            className="auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={2}
            autoComplete="username"
          />
        </label>
        <label className="auth-label">
          Email
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="auth-label">
          Password
          <input
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        <button type="submit" className="auth-submit">
          Register
        </button>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
