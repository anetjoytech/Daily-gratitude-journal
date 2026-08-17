import React from 'react';
import { PenLine, BookOpen, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

const MOOD_EMOJIS = {
  grateful: '🙏',
  joyful: '✨',
  peaceful: '🌿',
  energized: '⚡',
  reflective: '💭',
  hopeful: '🌅',
};

const EntriesSidebar = ({
  entries = [],
  selectedDate,
  onSelectDate,
  todayStr,
}) => {
  // Sort entries descending by date
  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const hasTodayEntry = entries.some((e) => e.date === todayStr);

  const formatDateLabel = (dateStr) => {
    if (dateStr === todayStr) return 'Today';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (dateStr === yesterdayStr) return 'Yesterday';

    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="sidebar-card">
      <div className="sidebar-header">
        <div className="sidebar-title-group">
          <BookOpen size={18} className="sidebar-icon" />
          <h3 className="sidebar-title">Recent Reflections</h3>
        </div>
        <span className="sidebar-count">{entries.length}</span>
      </div>

      {/* Quick Action: Today's Reflection */}
      <button
        type="button"
        onClick={() => onSelectDate(todayStr)}
        className={`sidebar-today-action ${selectedDate === todayStr ? 'active' : ''}`}
      >
        <div className="today-action-left">
          <div className={`today-indicator-dot ${hasTodayEntry ? 'completed' : 'pending'}`}>
            {hasTodayEntry ? <CheckCircle2 size={12} /> : <Clock size={12} />}
          </div>
          <div>
            <div className="today-action-title">Today's Practice</div>
            <div className="today-action-subtitle">
              {hasTodayEntry ? 'Reflection written' : 'Write for today'}
            </div>
          </div>
        </div>
        <PenLine size={16} className="today-action-pen" />
      </button>

      {/* List of Previous Reflections */}
      <div className="sidebar-entries-list">
        {sortedEntries.length === 0 ? (
          <div className="sidebar-empty">
            <p>No reflections yet</p>
            <span>Your written moments will appear here for 1-click access.</span>
          </div>
        ) : (
          sortedEntries.map((entry) => {
            const isSelected = selectedDate === entry.date;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelectDate(entry.date)}
                className={`sidebar-entry-item ${isSelected ? 'selected' : ''}`}
              >
                <div className="sidebar-entry-top">
                  <span className="sidebar-entry-date">
                    {formatDateLabel(entry.date)}
                  </span>
                  <span className="sidebar-entry-mood">
                    {MOOD_EMOJIS[entry.mood] || '✨'}
                  </span>
                </div>
                <p className="sidebar-entry-snippet">{entry.content}</p>
                {isSelected && <ChevronRight size={14} className="sidebar-entry-arrow" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EntriesSidebar;
