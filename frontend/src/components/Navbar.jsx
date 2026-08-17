import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Flame, LogOut, Moon, Sun, BookHeart } from 'lucide-react';

const Navbar = ({ stats, isDarkMode, toggleTheme }) => {
  const { user, logout } = useAuth();

  return (
    <header className="app-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-icon-wrapper">
            <BookHeart className="brand-icon" size={24} />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">Gratitude Journal</h1>
            <span className="brand-subtitle">One Paragraph a Day</span>
          </div>
        </div>

        <div className="navbar-actions">
          {stats && (
            <div className="streak-badge" title="Consecutive days written">
              <Flame className="streak-icon" size={18} />
              <span className="streak-count">{stats.current_streak || 0}</span>
              <span className="streak-label">Day Streak</span>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="user-profile-menu">
            <div className="user-avatar" title={user?.username}>
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="username-display">{user?.username}</span>
          </div>

          <button
            onClick={logout}
            className="logout-btn"
            title="Sign Out"
            id="logout-button"
          >
            <LogOut size={16} />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
