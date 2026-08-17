import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Edit3, Trash2, Sparkles, BookOpen } from 'lucide-react';

const MOOD_MAP = {
  grateful: { label: 'Grateful', emoji: '🙏', color: '#10b981' },
  joyful: { label: 'Joyful', emoji: '✨', color: '#f59e0b' },
  peaceful: { label: 'Peaceful', emoji: '🌿', color: '#06b6d4' },
  energized: { label: 'Energized', emoji: '⚡', color: '#ec4899' },
  reflective: { label: 'Reflective', emoji: '💭', color: '#8b5cf6' },
  hopeful: { label: 'Hopeful', emoji: '🌅', color: '#f97316' },
};

const EntriesList = ({ entries = [], onSelectDate, onDeleteEntry }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.prompt_answered &&
          entry.prompt_answered.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entry.date.includes(searchTerm);

      const matchesMood = selectedMood === 'all' || entry.mood === selectedMood;

      return matchesSearch && matchesMood;
    });
  }, [entries, searchTerm, selectedMood]);

  const formatCardDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="entries-list-container">
      {/* Controls Bar */}
      <div className="entries-controls">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search reflections or prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="clear-search-btn"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="mood-filter-group">
          <Filter size={16} className="filter-icon" />
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="mood-filter-select"
          >
            <option value="all">All Moods ({entries.length})</option>
            <option value="grateful">🙏 Grateful</option>
            <option value="joyful">✨ Joyful</option>
            <option value="peaceful">🌿 Peaceful</option>
            <option value="energized">⚡ Energized</option>
            <option value="reflective">💭 Reflective</option>
            <option value="hopeful">🌅 Hopeful</option>
          </select>
        </div>
      </div>

      {/* Entries Cards Grid */}
      {filteredEntries.length === 0 ? (
        <div className="empty-entries-state">
          <div className="empty-icon-circle">
            <BookOpen size={36} />
          </div>
          <h3 className="empty-title">
            {searchTerm || selectedMood !== 'all'
              ? 'No matching reflections found'
              : 'No gratitude entries yet'}
          </h3>
          <p className="empty-subtitle">
            {searchTerm || selectedMood !== 'all'
              ? 'Try adjusting your search terms or filter selection.'
              : 'Start your mindful journey by writing your first paragraph of gratitude today!'}
          </p>
        </div>
      ) : (
        <div className="entries-cards-grid">
          {filteredEntries.map((entry) => {
            const moodInfo = MOOD_MAP[entry.mood] || {
              label: entry.mood || 'Grateful',
              emoji: '✨',
              color: '#6366f1',
            };

            return (
              <div key={entry.id} className="entry-card">
                <div className="entry-card-header">
                  <div className="entry-card-date">
                    <Calendar size={15} />
                    <span>{formatCardDate(entry.date)}</span>
                  </div>

                  <span
                    className="entry-mood-badge"
                    style={{ borderColor: moodInfo.color }}
                  >
                    <span>{moodInfo.emoji}</span>
                    <span>{moodInfo.label}</span>
                  </span>
                </div>

                {entry.prompt_answered && (
                  <div className="entry-card-prompt">
                    <Sparkles size={13} className="card-prompt-icon" />
                    <span>"{entry.prompt_answered}"</span>
                  </div>
                )}

                <p className="entry-card-content">{entry.content}</p>

                <div className="entry-card-footer">
                  <span className="entry-word-count">
                    {entry.content.split(/\s+/).length} words
                  </span>

                  <div className="entry-card-actions">
                    <button
                      type="button"
                      onClick={() => onSelectDate(entry.date)}
                      className="card-edit-btn"
                      title="Edit in Journal"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEntry(entry.id)}
                      className="card-delete-btn"
                      title="Delete reflection"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EntriesList;
