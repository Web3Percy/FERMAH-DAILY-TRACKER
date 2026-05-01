'use client';

import { useState, useEffect } from 'react';

const DAILY_TASKS = [
  { id: 'post', label: 'Post Content (X/Social)', icon: '📝' },
  { id: 'discord', label: 'Check Discord (Community)', icon: '💬' },
  { id: 'spotlight', label: 'Submit to Spotlight', icon: '🌟' },
  { id: 'engage', label: 'Engage with 3+ Posts', icon: '🤝' },
];

// Gets pure local date (YYYY-MM-DD) avoiding UTC timezone bugs
const getLocalToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function FermahTracker() {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Theme Setup
    const storedTheme = localStorage.getItem('fermah-theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === 'dark') document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    // ATOMIC DATA LOAD: One single file for all data to prevent sync bugs
    const today = getLocalToday();
    const dataStr = localStorage.getItem('fermah-data');
    let data = dataStr ? JSON.parse(dataStr) : { lastCheckIn: '', tasks: {}, streak: 0, lastStreakDate: '' };

    if (data.lastCheckIn !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      const allDoneYesterday = DAILY_TASKS.every(task => data.tasks[task.id]);

      if (data.lastCheckIn === yesterdayStr && allDoneYesterday) {
        // Streak continues
      } else {
        // Streak broken
        data.streak = 0;
      }

      // Reset for the new day
      data.tasks = {};
      data.lastCheckIn = today;
      localStorage.setItem('fermah-data', JSON.stringify(data));
    }

    setCompletedTasks(data.tasks);
    setCurrentStreak(data.streak);
    setHydrated(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('fermah-theme', newTheme);
  };

  const handleToggleTask = (taskId: string) => {
    if (completedTasks[taskId]) return; // Strict lock logic

    const today = getLocalToday();
    const dataStr = localStorage.getItem('fermah-data');
    let data = dataStr ? JSON.parse(dataStr) : { lastCheckIn: today, tasks: {}, streak: 0, lastStreakDate: '' };

    // Update the specific task
    data.tasks[taskId] = true;
    setCompletedTasks(data.tasks);

    // Verify if all tasks are complete
    const todayFinished = DAILY_TASKS.every(task => data.tasks[task.id]);

    if (todayFinished && data.lastStreakDate !== today) {
      data.streak += 1;
      data.lastStreakDate = today;
      setCurrentStreak(data.streak);
    }

    // Save atomic state
    localStorage.setItem('fermah-data', JSON.stringify(data));
  };

  const FermahLogoPi = ({ className = 'w-10 h-10' }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="15" width="70" height="20" rx="2" fill="#00C49F"/>
      <rect x="25" y="35" width="15" height="30" rx="1" fill="#00C49F"/>
      <rect x="60" y="35" width="15" height="30" rx="1" fill="#00C49F"/>
      <rect x="15" y="65" width="15" height="15" rx="1" fill="#00C49F"/>
      <rect x="70" y="65" width="15" height="15" rx="1" fill="#00C49F"/>
    </svg>
  );

  const allTasksDone = hydrated && DAILY_TASKS.every(task => completedTasks[task.id]);

  return (
    <div className={`${theme} min-h-screen font-sans`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-10 transition-colors duration-200">
        <header className="flex items-center justify-between pb-8 border-b border-slate-200 dark:border-slate-800 mb-10">
          <div className="flex items-center gap-4">
            <FermahLogoPi className="w-12 h-12" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">
              Fermah <span className="text-sm font-medium text-slate-500 dark:text-slate-500">Daily Tracker</span>
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00C49F] dark:hover:border-[#00C49F] text-lg transition"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </header>

        <main className="max-w-4xl mx-auto space-y-10">
          {hydrated && (
            <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div>
                <h2 className="text-lg font-semibold text-slate-500 dark:text-slate-400">Current Ecosystem Streak</h2>
                <div className="flex items-center justify-center md:justify-start gap-4">
                    <p className={`text-6xl md:text-7xl font-extrabold tracking-tighter ${allTasksDone ? 'text-[#00C49F]' : ''}`}>
                    🔥 {currentStreak} Days
                    </p>
                </div>
              </div>
              {allTasksDone ? (
                <div className="bg-[#00C49F]/10 text-[#00C49F] px-5 py-3 rounded-xl font-bold border border-[#00C49F]/30 flex items-center gap-2">
                  <span>✅</span> Perfect Day Complete!
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-300 max-w-sm text-sm">
                  Complete all tasks today to extend your streak. Don’t miss a day or the ecosystem resets!
                </p>
              )}
            </section>
          )}

          {hydrated && (
            <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold tracking-tight">Today’s Fermah Blueprint</h3>
                <span className="text-sm font-medium text-slate-400 dark:text-slate-600">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div className="space-y-4">
                {DAILY_TASKS.map((task) => {
                  const isChecked = completedTasks[task.id] || false;
                  
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-5 p-5 rounded-2xl bg-slate-100 dark:bg-slate-950 border transition ${
                        isChecked 
                          ? 'border-[#00C49F]/50 opacity-80' 
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className={`text-3xl ${isChecked ? 'grayscale opacity-50' : ''}`}>{task.icon}</div>

                      <label 
                        className={`flex-grow text-lg font-medium ${isChecked ? 'text-slate-500 line-through' : ''}`}
                      >
                        {task.label}
                      </label>

                      {/* Rock-solid SVG checkmark button */}
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        disabled={isChecked}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isChecked 
                            ? 'bg-[#00C49F] border-[#00C49F] cursor-not-allowed' 
                            : 'border-slate-400 dark:border-slate-600 cursor-pointer'
                        }`}
                      >
                        {isChecked && (
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
