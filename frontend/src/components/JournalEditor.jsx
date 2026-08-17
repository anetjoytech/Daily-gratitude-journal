import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Save,
  Trash2,
  Calendar as CalendarIcon,
  CheckCircle,
  RefreshCw,
  Clock,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

const PROMPTS = [
  "What is a simple, everyday comfort you appreciated today?",
  "Who is someone who brought positivity into your life recently, and why?",
  "What is a small win or accomplishment that made you feel proud?",
  "What is something beautiful in nature or your surroundings you noticed today?",
  "What challenge or obstacle did you face that taught you something valuable?",
  "What made you genuinely smile or laugh out loud today?",
  "What is a skill or ability you have that you are thankful for?",
  "What is something you are looking forward to with hope and excitement?"
];

const MOODS = [
  { id: 'grateful', label: 'Grateful', emoji: '🙏' },
  { id: 'joyful', label: 'Joyful', emoji: '✨' },
  { id: 'peaceful', label: 'Peaceful', emoji: '🌿' },
  { id: 'energized', label: 'Energized', emoji: '⚡' },
  { id: 'reflective', label: 'Reflective', emoji: '💭' },
  { id: 'hopeful', label: 'Hopeful', emoji: '🌅' },
];

const JournalEditor = ({
  selectedDate,
  onSelectDate,
  existingEntry,
  entries = [],
  onSaveEntry,
  onDeleteEntry,
  saving,
}) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('grateful');
  const [prompt, setPrompt] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Sync state when selected date or existingEntry changes
  useEffect(() => {
    if (existingEntry) {
      setContent(existingEntry.content || '');
      setMood(existingEntry.mood || 'grateful');
      setPrompt(existingEntry.prompt_answered || '');
    } else {
      setContent('');
      setMood('grateful');
      // Pick random initial prompt
      const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
      setPrompt(randomPrompt);
    }
    setSaveSuccess(false);
  }, [selectedDate, existingEntry]);

  const handleShufflePrompt = () => {
    const remaining = PROMPTS.filter((p) => p !== prompt);
    const nextPrompt = remaining[Math.floor(Math.random() * remaining.length)];
    setPrompt(nextPrompt);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!content.trim()) return;

    const payload = {
      date: selectedDate,
      content: content.trim(),
      mood,
      prompt_answered: prompt,
    };

    const success = await onSaveEntry(payload);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#6366f1', '#ec4899', '#f59e0b', '#10b981'],
        });
      } catch {
        // Fallback gracefully
      }
    }
  };

  const handleDelete = async () => {
    if (existingEntry?.id) {
      await onDeleteEntry(existingEntry.id);
      setShowDeleteModal(false);
    }
  };

  // Date shifting helpers
  const shiftDate = (days) => {
    if (!selectedDate) return;
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const newDateStr = `${year}-${month}-${day}`;
    onSelectDate(newDateStr);
  };

  // Format human-friendly date
  const formattedDate = useMemo(() => {
    if (!selectedDate) return '';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const isToday = todayStr === selectedDate;
    const dateText = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return isToday ? `Today (${dateText})` : dateText;
  }, [selectedDate, todayStr]);

  // Quick days list (past 7 days)
  const quickDays = useMemo(() => {
    const list = [];
    const [y, m, d] = todayStr.split('-').map(Number);
    for (let i = 0; i < 7; i++) {
      const dt = new Date(y, m - 1, d);
      dt.setDate(dt.getDate() - i);
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      let label = '';
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Yesterday';
      else {
        label = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      }

      const match = entries.find((e) => e.date === dateStr);
      list.push({
        dateStr,
        label,
        hasEntry: !!match,
        moodEmoji: match ? MOODS.find((m) => m.id === match.mood)?.emoji || '✨' : null,
      });
    }
    return list;
  }, [todayStr, entries]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const isToday = selectedDate === todayStr;

  return (
    <div className="editor-card">
      {/* Simple Top Date Selector & Quick Switcher */}
      <div className="date-navigator-bar">
        <div className="date-nav-controls">
          <button
            type="button"
            onClick={() => shiftDate(-1)}
            className="date-step-btn"
            title="Previous Day"
            aria-label="Previous Day"
          >
            <ChevronLeft size={18} />
            <span className="step-btn-text">Previous</span>
          </button>

          <div className="date-picker-wrapper">
            <CalendarIcon size={18} className="picker-icon" />
            <span className="current-date-display">{formattedDate}</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && onSelectDate(e.target.value)}
              className="native-date-input"
              title="Click to pick a specific date"
            />
          </div>

          <button
            type="button"
            onClick={() => shiftDate(1)}
            className="date-step-btn"
            title="Next Day"
            aria-label="Next Day"
          >
            <span className="step-btn-text">Next</span>
            <ChevronRight size={18} />
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={() => onSelectDate(todayStr)}
              className="jump-today-btn"
              title="Jump to Today"
            >
              <RotateCcw size={14} />
              <span>Today</span>
            </button>
          )}
        </div>

        {/* Quick Day Chips (Today, Yesterday, etc.) */}
        <div className="quick-days-strip">
          <span className="quick-days-label">Quick select:</span>
          <div className="quick-days-scroll">
            {quickDays.map((qd) => (
              <button
                key={qd.dateStr}
                type="button"
                onClick={() => onSelectDate(qd.dateStr)}
                className={`quick-day-pill ${selectedDate === qd.dateStr ? 'active' : ''} ${
                  qd.hasEntry ? 'has-entry' : ''
                }`}
              >
                {qd.moodEmoji && <span className="pill-mood">{qd.moodEmoji}</span>}
                <span className="pill-text">{qd.label}</span>
                {qd.hasEntry && <span className="pill-check-dot" title="Reflection saved" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Sub-Header */}
      <div className="editor-status-bar">
        <div className="editor-mode-indicator">
          {existingEntry ? (
            <span className="mode-badge editing-badge">
              <CheckCircle size={14} /> Editing saved reflection
            </span>
          ) : (
            <span className="mode-badge new-badge">
              <Sparkles size={14} /> New gratitude entry
            </span>
          )}
        </div>

        {existingEntry && (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="delete-entry-btn"
            title="Delete this reflection"
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        )}
      </div>

      {/* Mindful Prompt Box */}
      <div className="prompt-container">
        <div className="prompt-header">
          <div className="prompt-title">
            <Sparkles size={16} className="prompt-icon" />
            <span>Daily Reflection Prompt</span>
          </div>
          <button
            type="button"
            onClick={handleShufflePrompt}
            className="shuffle-prompt-btn"
            title="Get another prompt"
          >
            <RefreshCw size={14} />
            <span>Shuffle Prompt</span>
          </button>
        </div>
        <p className="prompt-text">"{prompt}"</p>
      </div>

      <form onSubmit={handleSave} className="editor-form">
        {/* Mood Selector */}
        <div className="mood-selector-container">
          <label className="mood-label">
            <HeartHandshake size={15} />
            <span>How does this moment feel?</span>
          </label>
          <div className="mood-options-grid">
            {MOODS.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setMood(m.id)}
                className={`mood-pill ${mood === m.id ? 'active' : ''}`}
              >
                <span className="mood-emoji">{m.emoji}</span>
                <span className="mood-text">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Paragraph */}
        <div className="content-input-group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your one paragraph of gratitude here... What brought warmth, joy, or meaning to your day?"
            rows={7}
            className="journal-textarea"
            required
            id="gratitude-entry-textarea"
          />
          <div className="textarea-footer">
            <div className="stats-counters">
              <span className="counter-item">{wordCount} words</span>
              <span className="counter-dot">•</span>
              <span className="counter-item">{charCount} characters</span>
            </div>
            {existingEntry?.updated_at && (
              <div className="last-saved-hint">
                <Clock size={12} />
                <span>
                  Saved {new Date(existingEntry.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div className="editor-footer">
          <div className="status-notification">
            {saveSuccess && (
              <span className="success-banner">
                <CheckCircle size={16} /> Gratitude saved successfully!
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !content.trim()}
            className="save-entry-btn"
            id="save-gratitude-button"
          >
            {saving ? (
              <>
                <div className="btn-spinner"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{existingEntry ? 'Update Gratitude' : 'Save Reflection'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Delete Gratitude Entry?</h3>
            <p className="modal-description">
              Are you sure you want to delete your gratitude reflection for{' '}
              <strong>{selectedDate}</strong>? This action cannot be undone.
            </p>
            <div className="modal-buttons">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="modal-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="modal-confirm-delete-btn"
              >
                Yes, Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEditor;
