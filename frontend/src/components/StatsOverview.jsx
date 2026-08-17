import React from 'react';
import { Flame, Trophy, BookHeart, CheckCircle2, Clock, Sparkles } from 'lucide-react';

const StatsOverview = ({ stats, onWriteToday }) => {
  const currentStreak = stats?.current_streak || 0;
  const longestStreak = stats?.longest_streak || 0;
  const totalEntries = stats?.total_entries || 0;
  const hasLoggedToday = stats?.has_logged_today || false;

  return (
    <div className="stats-overview-grid">
      {/* Current Streak */}
      <div className="stat-card streak-card">
        <div className="stat-icon-wrapper streak-bg">
          <Flame size={24} className="stat-icon flame-animation" />
        </div>
        <div className="stat-content">
          <span className="stat-label">Current Streak</span>
          <div className="stat-value-group">
            <span className="stat-value">{currentStreak}</span>
            <span className="stat-unit">{currentStreak === 1 ? 'day' : 'days'}</span>
          </div>
          <p className="stat-subtext">
            {currentStreak > 0
              ? 'Keep the momentum going!'
              : 'Start your streak today!'}
          </p>
        </div>
      </div>

      {/* Longest Streak */}
      <div className="stat-card longest-card">
        <div className="stat-icon-wrapper trophy-bg">
          <Trophy size={24} className="stat-icon" />
        </div>
        <div className="stat-content">
          <span className="stat-label">Best Streak</span>
          <div className="stat-value-group">
            <span className="stat-value">{longestStreak}</span>
            <span className="stat-unit">{longestStreak === 1 ? 'day' : 'days'}</span>
          </div>
          <p className="stat-subtext">Your all-time personal best</p>
        </div>
      </div>

      {/* Total Entries */}
      <div className="stat-card entries-card">
        <div className="stat-icon-wrapper book-bg">
          <BookHeart size={24} className="stat-icon" />
        </div>
        <div className="stat-content">
          <span className="stat-label">Total Reflections</span>
          <div className="stat-value-group">
            <span className="stat-value">{totalEntries}</span>
            <span className="stat-unit">paragraphs</span>
          </div>
          <p className="stat-subtext">Moments of mindfulness captured</p>
        </div>
      </div>

      {/* Today's Status Banner */}
      <div className={`stat-card status-card ${hasLoggedToday ? 'status-completed' : 'status-pending'}`}>
        <div className="stat-icon-wrapper status-bg">
          {hasLoggedToday ? (
            <CheckCircle2 size={24} className="stat-icon check-icon" />
          ) : (
            <Clock size={24} className="stat-icon clock-icon" />
          )}
        </div>
        <div className="stat-content">
          <span className="stat-label">Today's Reflection</span>
          <div className="stat-value-group">
            <span className="stat-status-text">
              {hasLoggedToday ? 'Completed' : 'Pending'}
            </span>
          </div>
          {!hasLoggedToday ? (
            <button
              type="button"
              onClick={onWriteToday}
              className="quick-write-btn"
            >
              <Sparkles size={14} />
              <span>Write for Today</span>
            </button>
          ) : (
            <p className="stat-subtext">You have nourished your mindset today!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
