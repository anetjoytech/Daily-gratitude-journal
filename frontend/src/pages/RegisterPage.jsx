import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Mail, BookHeart, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import api from "../api/axios";

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("auth/register/", {
  username,
  email,
  password,
  password2: confirmPassword,
});
    navigate("/login");
  }   catch (err) {
    console.error(err);
    setError("Registration failed. Please check your inputs.");
  }
};

    if (!username.trim() || !password || !passwordConfirm) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setSubmitting(true);

    const result = await register(username.trim(), email.trim(), password, passwordConfirm);
    setSubmitting(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <BookHeart size={32} />
          </div>
          <h1 className="auth-title">Begin Your Journey</h1>
          <p className="auth-subtitle">
            Create your private gratitude sanctuary today
          </p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">
              Username *
            </label>
            <div className="form-input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="reg-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="form-input"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Email Address (optional)
            </label>
            <div className="form-input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              Password * (min 6 chars)
            </label>
            <div className="form-input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                className="form-input"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password-confirm">
              Confirm Password *
            </label>
            <div className="form-input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="reg-password-confirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Confirm your password"
                className="form-input"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="auth-submit-btn"
            id="register-submit-btn"
          >
            {submitting ? (
              <>
                <div className="btn-spinner" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-links">
          <p className="auth-switch-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
