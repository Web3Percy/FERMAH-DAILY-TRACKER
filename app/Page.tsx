'use client';

import { useState, useEffect } from 'react';

// Define the core tasks and their icons
const DAILY_TASKS = [
  { id: 'post', label: 'Post Content (X/Social)', icon: '📝' },
  { id: 'discord', label: 'Check Discord (Community)', icon: '💬' },
  { id: 'spotlight', label: 'Submit to Spotlight', icon: '🌟' },
  { id: 'engage', label: 'Engage with 3+ Posts', icon: '🤝' },
];

export default function FermahTracker() {
  // --- State Management ---
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [hydrated, setHydrated] = useState(false); // Fix hydration mismatch

  // --- Theme Toggle Logic ---
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('fermah-theme', newTheme);
  };

  // --- Initial Load (Hydration & LocalStorage Read) ---
  useEffect(() => {
    // Read stored theme
    const storedTheme = localStorage.getItem('fermah-theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === 'dark') document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('dark'); // Default to dark
    }

    // Read stored tracker data
    const storedTasks = localStorage.getItem('fermah-completed-tasks');
    const storedStreak = localStorage.getItem('fermah-streak');
    const storedDate = localStorage.getItem('fermah-last-checkin');

    const todayString = new Date().toISOString().split('T')[0];

    if (storedDate === todayString) {
      // It is still today, load today's completion data
      if (storedTasks) setCompletedTasks(JSON.parse(storedTasks));
      if (storedStreak) setCurrentStreak(parseInt(storedStreak, 10));
    } else if (storedDate) {
      // It is a new day! Handle streak reset/increment
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      let streakCount = storedStreak ? parseInt(storedStreak, 10) : 0;

      // Check if all tasks were done yesterday
      const yesterdayTasks = JSON.parse(storedTasks || '{}');
      const allDoneYesterday = DAILY_TASKS.every(task => yesterdayTasks[task.id]);

      if (storedDate === yesterdayString && allDoneYesterday) {
        // Perfect yesterday! Streak continues. Increment it.
        // We do NOT increment it *immediately* until they finish today's tasks.
        // The display will show the streak they 'earned' yesterday.
        // (The standard way to handle streaks until you finish the current day)
        // Alternative approach: streak += 1, and only resets if they MISS.
        // We will do the 'streak earned yesterday' logic for now.
        if (storedStreak) setCurrentStreak(parseInt(storedStreak, 10));
      } else {
        // They missed a day or yesterday wasn't finished. Reset.
        setCurrentStreak(0);
      }

      // Reset today's checklist for the new day
      setCompletedTasks({});
      localStorage.setItem('fermah-completed-tasks', JSON.parse('{}'));
      // Update last check-in to today
      setLastCheckIn(todayString);
      localStorage.setItem('fermah-last-checkin', todayString);
    } else {
      // First time user logic
      setLastCheckIn(todayString);
      localStorage.setItem('fermah-last-checkin', todayString);
    }

    setHydrated(true); // Mark as hydrated
  }, []);

  // --- Task Completion Logic & Streak Update ---
  const handleToggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const newTasks = { ...prev, [taskId]: !prev[taskId] };
      localStorage.setItem('fermah-completed-tasks', JSON.stringify(newTasks));

      // Calculate streak update: Does checking this box mean today is finished?
      const todayFinished = DAILY_TASKS.every(task => newTasks[task.id]);

      if (todayFinished) {
        // Full completion! Update streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        const storedDate = localStorage.getItem('fermah-last-checkin');

        // Logic check: only increment if yesterday was a success or if streak is 0.
        // If yesterday was missed (streak reset to 0), and they finish today, streak is 1.
        // If yesterday was success, and they finish today, streak is yesterday+1.

        let baseStreak = parseInt(localStorage.getItem('fermah-streak') || '0', 10);
        // Special case: if yesterday was MISSED and they finish today, streak starts fresh at 1.
        // Our 'yesterday missed' logic resets storedStreak to 0.

        setCurrentStreak(prevStreak => {
            let nextStreak = prevStreak;
            if(prevStreak === 0 && todayFinished) {
                 nextStreak = 1;
            } else if (todayFinished) {
                 nextStreak += 1;
            }
            localStorage.setItem('fermah-streak', nextStreak.toString());
            return nextStreak;
        });

      } else {
        // Unchecked a box, maybe they are undoing it.
        // We don't decrement the streak unless they fail the reset logic tomorrow.
      }

      return newTasks;
    });
  };

  // --- SVG Logo (Recreating the visual pixel pi shape) ---
  const FermahLogoPi = ({ className = 'w-10 h-10' }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Target Color: #00C49F */}
      {/* Top Header Bar */}
      <rect x="15" y="15" width="70" height="20" rx="2" fill="#00C49F"/>
      {/* Left Pillar */}
      <rect x="25" y="35" width="15" height="30" rx="1" fill="#00C49F"/>
      {/* Right Pillar */}
      <rect x="60" y="35" width="15" height="30" rx="1" fill="#00C49F"/>
      {/* Bottom Left Pixel Node */}
      <rect x="15" y="65" width="15" height="15" rx="1" fill="#00C49F"/>
      {/* Bottom Right Pixel Node */}
      <rect x="70" y="65" width="15" height="15" rx="1" fill="#00C49F"/>
    </svg>
  );

  // --- Checklist Render Logic ---
  const allTasksDone = hydrated && DAILY_TASKS.every(task => completedTasks[task.id]);

  return (
    <div className={`${theme} min-h-screen font-sans`}>
      {/* Main Container with subtle transition between modes */}
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-10 transition-colors duration-200">

        {/* --- Header & Theme Toggle --- */}
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

        {/* --- Main Dashboard Content --- */}
        <main className="max-w-4xl mx-auto space-y-10">

          {/* --- Streak Hero Section --- */}
          {hydrated && (
            <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div>
                <h2 className="text-lg font-semibold text-slate-500 dark:text-slate-400">Current Ecosystem Streak</h2>
                <p className={`text-6xl md:text-7xl font-extrabold tracking-tighter ${allTasksDone ? 'text-[#00C49F]' : ''}`}>
                  🔥 {currentStreak} Days
                </p>
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

          {/* --- Daily Checklist Card --- */}
          {hydrated && (
            <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold tracking-tight">Today’s Fermah Blueprint</h3>
                <span className="text-sm font-medium text-slate-400 dark:text-slate-600">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div className="space-y-4">
                {DAILY_TASKS.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-5 p-5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition hover:border-[#00C49F]/30"
                  >
                    <div className="text-3xl">{task.icon}</div>

                    <label htmlFor={task.id} className="flex-grow text-lg font-medium cursor-pointer">
                      {task.label}
                    </label>

                    {/* Styled Checkbox/Toggle using the specific teal color */}
                    <div className="relative inline-block w-12 h-12 flex items-center justify-center">
                      <input
                        id={task.id}
                        type="checkbox"
                        checked={completedTasks[task.id] || false}
                        onChange={() => handleToggleTask(task.id)}
                        className="peer sr-only"
                      />
                      <div className="w-9 h-9 border-4 border-slate-300 dark:border-slate-700 rounded-full transition group peer-checked:border-[#00C49F] peer-focus:ring-2 peer-focus:ring-[#00C49F]/30 flex items-center justify-center">
                        <div className="w-5 h-5 bg-transparent rounded-full scale-0 peer-checked:scale-100 peer-checked:bg-[#00C49F] transition duration-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* --- Minimal Footer / Accountability Hook --- */}
        <footer className="max-w-4xl mx-auto mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-600">
          <p>Personal Fermah Accountability Terminal. Build by grinding. Depoyed today.</p>
        </footer>

      </div>
    </div>
  );
}
