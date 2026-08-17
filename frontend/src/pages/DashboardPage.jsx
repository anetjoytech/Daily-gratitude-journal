import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import StatsOverview from '../components/StatsOverview';
import EntriesSidebar from '../components/EntriesSidebar';
import JournalEditor from '../components/JournalEditor';
import EntriesList from '../components/EntriesList';
import { PenLine, ListFilter, Sparkles } from 'lucide-react';

const DashboardPage = () => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('journal'); // 'journal' | 'timeline'
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('app_theme') === 'dark' ||
      (!('app_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Apply theme class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('app_theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('app_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Fetch entries and stats
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [entriesRes, statsRes] = await Promise.all([
        api.get('entries/'),
        api.get('entries/stats/'),
      ]);
      setEntries(entriesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load journal data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Find existing entry for currently selected date
  const currentEntry = useMemo(() => {
    return entries.find((e) => e.date === selectedDate) || null;
  }, [entries, selectedDate]);

  // Save or Update Entry
  const handleSaveEntry = async (entryData) => {
    try {
      setSaving(true);
      if (currentEntry) {
        // Update existing entry
        const res = await api.put(`entries/${currentEntry.id}/`, entryData);
        setEntries((prev) =>
          prev.map((e) => (e.id === currentEntry.id ? res.data : e))
        );
      } else {
        // Create new entry
        const res = await api.post('entries/', entryData);
        setEntries((prev) => [res.data, ...prev]);
      }

      // Refresh streak stats
      const statsRes = await api.get('entries/stats/');
      setStats(statsRes.data);
      return true;
    } catch (err) {
      console.error('Failed to save journal entry:', err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Delete Entry
  const handleDeleteEntry = async (id) => {
    try {
      await api.delete(`entries/${id}/`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      const statsRes = await api.get('entries/stats/');
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const handleSelectDate = (dateStr) => {
    setSelectedDate(dateStr);
    setActiveTab('journal');
  };

  const handleWriteToday = () => {
    setSelectedDate(todayStr);
    setActiveTab('journal');
  };

  return (
    <div className="dashboard-layout">
      <Navbar
        stats={stats}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <main className="dashboard-content">
        <div className="content-container">
          {/* Top Hero Stats */}
          <section className="stats-section">
            <StatsOverview
              stats={stats}
              onWriteToday={handleWriteToday}
            />
          </section>

          {/* Tab Navigation */}
          <div className="tab-navigation-bar">
            <button
              onClick={() => setActiveTab('journal')}
              className={`tab-nav-btn ${activeTab === 'journal' ? 'active' : ''}`}
            >
              <PenLine size={18} />
              <span>Daily Journal</span>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`tab-nav-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            >
              <ListFilter size={18} />
              <span>All Reflections ({entries.length})</span>
            </button>
          </div>

          {/* Tab Views */}
          {loading ? (
            <div className="dashboard-loader">
              <div className="spinner"></div>
              <p>Gathering your reflections...</p>
            </div>
          ) : activeTab === 'journal' ? (
            <div className="journal-workspace-grid">
              {/* Left Column: Recent Reflections List */}
              <div className="workspace-column sidebar-col">
                <EntriesSidebar
                  entries={entries}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  todayStr={todayStr}
                />
              </div>

              {/* Right Column: Distraction-Free Gratitude Editor with Date Navigator */}
              <div className="workspace-column editor-col">
                <JournalEditor
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  existingEntry={currentEntry}
                  entries={entries}
                  onSaveEntry={handleSaveEntry}
                  onDeleteEntry={handleDeleteEntry}
                  saving={saving}
                />
              </div>
            </div>
          ) : (
            <div className="timeline-workspace">
              <EntriesList
                entries={entries}
                onSelectDate={handleSelectDate}
                onDeleteEntry={handleDeleteEntry}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
