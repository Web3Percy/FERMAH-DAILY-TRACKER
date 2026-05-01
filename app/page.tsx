'use client';

import { useState, useEffect } from 'react';

const DAILY_TASKS = [
  { id: 'post', label: 'Post Content (X/Social)', icon: '📝' },
  { id: 'discord', label: 'Check Discord (Community)', icon: '💬' },
  { id: 'spotlight', label: 'Submit to Spotlight', icon: '🌟' },
  { id: 'engage', label: 'Engage with 3+ Posts', icon: '🤝' },
];

export default function FermahTracker() {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [hydrated, setHydrated] = useState(false); 

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('fermah-theme', newTheme);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('fermah-theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === 'dark') document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('dark'); 
    }

    const storedTasks = localStorage.getItem('fermah-completed-tasks');
    const storedStreak = localStorage.getItem('fermah-streak');
    const storedDate = localStorage.getItem('fermah-last-checkin');
    
    const todayString = new Date().toISOString().split('T')[0];

    if (storedDate === todayString) {
      if (storedTasks) setCompletedTasks(JSON.parse(storedTasks));
      if (storedStreak) setCurrentStreak(parseInt(storedStreak, 10));
    } else if (storedDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      const yesterdayTasks = JSON.parse(storedTasks || '{}');
      const allDoneYesterday = DAILY_TASKS.every(task => yesterdayTasks[task.id]);

      if (storedDate === yesterdayString && allDoneYesterday) {
        if (storedStreak) setCurrentStreak(parseInt(storedStreak, 10));
      } else {
        setCurrentStreak(0);
        localStorage.setItem('fermah-streak', '0');
      }

      setCompletedTasks({});
      localStorage.setItem('fermah-completed-tasks', JSON.stringify({}));
      localStorage.setItem('fermah-last-checkin', todayString);
    } else {
      localStorage.setItem('fermah-last-checkin', todayString);
    }

    setHydrated(true); 
  }, []);

  const handleToggleTask = (taskId: string) => {
    // THE STRICT LOCK: If the task is already checked, stop the function immediately.
    if (completedTasks[taskId]) return;

    setCompletedTasks(prev => {
      const newTasks = { ...prev, [taskId]: true }; // Force it to true only
      localStorage.setItem('fermah-completed-tasks', JSON.stringify(newTasks));

      const todayFinished = DAILY_TASKS.every(task => newTasks[task.id]);
      const todayString = new Date().toISOString().split('T')[0];
      const lastStreakDate = localStorage.getItem('fermah-last-streak-date');

      if (todayFinished && lastStreakDate !== todayString) {
        // Lock it in for today
        setCurrentStreak(s => {
          const newStreak = s + 1;
          localStorage.setItem('fermah-streak', newStreak.toString());
          return newStreak;
        });
        localStorage.setItem('fermah-last-streak-date', todayString);
      } 

      return newTasks;
    });
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
                          : 'border-slate-200 dark:border-slate-800 hover:border-[#00C49F]/30'
                      }`}
                    >
                      <div className={`text-3xl ${isChecked ? 'grayscale' : ''}`}>{task.icon}</div>

                      <label 
                        htmlFor={task.id} 
                        className={`flex-grow text-lg font-medium ${isChecked ? 'text-slate-500 line-through cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {task.label}
                      </label>

                      <div className="relative inline-block w-12 h-12 flex items-center justify-center">
                        <input
                          id={task.id}
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleTask(task.id)}
                          disabled={isChecked}
                          className="peer sr-only"
                        />
                        <div className={`w-9 h-9 border-4 rounded-full transition group flex items-center justify-center ${
                          isChecked 
                            ? 'border-[#00C49F] cursor-not-allowed' 
                            : 'border-slate-300 dark:border-slate-700 peer-focus:ring-2 peer-focus:ring-[#00C49F]/30'
                        }`}>
                          <div className={`w-5 h-5 bg-transparent rounded-full transition duration-200 ${isChecked ? 'scale-100 bg-[#00C49F]' : 'scale-0'}`} />
                        </div>
                      </div>
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
