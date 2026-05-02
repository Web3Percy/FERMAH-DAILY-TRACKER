'use client';

import { useState, useEffect } from 'react';

const DAILY_TASKS = [
  { id: 'post', label: 'Post Content (X/Social)', icon: '📝', placeholder: 'https://x.com/yourhandle/status/...' },
  { id: 'gm', label: 'Gm in Gm channel', icon: '💬', placeholder: 'https://discord.com/channels/1266746067265916978/1277635543034757130/...' },
  { id: 'echo', label: 'The Official Echo', icon: '🔁', placeholder: 'https://x.com/yourhandle/status/...' },
];

const WEEKLY_TASK = { 
  id: 'spotlight', 
  label: 'Submit to Spotlight', 
  icon: '🌟', 
  placeholder: 'https://discord.com/channels/1266746067265916978/1285714079087988797/...' 
};

// Utilities for Date Math
const getLocalToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getMostRecentFriday = () => {
  const d = new Date();
  const dayOfWeek = d.getDay(); // Sun=0, Mon=1, ..., Fri=5, Sat=6
  const daysToSubtract = (dayOfWeek + 2) % 7; 
  d.setDate(d.getDate() - daysToSubtract);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function FermahTracker() {
  const [completedDailyTasks, setCompletedDailyTasks] = useState<Record<string, boolean>>({});
  const [spotlightDone, setSpotlightDone] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [hydrated, setHydrated] = useState(false);
  
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verifyUrl, setVerifyUrl] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    // Theme setup
    const storedTheme = localStorage.getItem('fermah-theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === 'dark') document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    const today = getLocalToday();
    const currentFriday = getMostRecentFriday();
    
    const dataStr = localStorage.getItem('fermah-data');
    let data = dataStr ? JSON.parse(dataStr) : { 
      lastCheckIn: '', 
      dailyTasks: {}, 
      spotlightDone: false,
      currentCycle: currentFriday,
      streak: 0, 
      lastStreakDate: '' 
    };

    // BUG FIX: Upgrade old local storage data to the new format to prevent crash
    if (!data.dailyTasks) data.dailyTasks = data.tasks || {};
    if (data.spotlightDone === undefined) data.spotlightDone = false;
    if (!data.currentCycle) data.currentCycle = currentFriday;

    // 1. Weekly Boss Quest Check (The Friday Reset)
    if (data.currentCycle !== currentFriday) {
      if (!data.spotlightDone) {
        data.streak = 0; // Burn streak if weekly quest was missed
      }
      data.currentCycle = currentFriday;
      data.spotlightDone = false; // Reset the quest for the new week
    }

    // 2. Daily Grind Check
    if (data.lastCheckIn !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      const allDoneYesterday = DAILY_TASKS.every(task => data.dailyTasks[task.id]);

      if (data.lastCheckIn === yesterdayStr && allDoneYesterday) {
        // Streak survives the daily check
      } else if (data.lastCheckIn !== '') {
        data.streak = 0; // Burn streak if a day was skipped
      }

      data.dailyTasks = {};
      data.lastCheckIn = today;
    }

    localStorage.setItem('fermah-data', JSON.stringify(data));
    setCompletedDailyTasks(data.dailyTasks);
    setSpotlightDone(data.spotlightDone);
    setCurrentStreak(data.streak);
    setHydrated(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('fermah-theme', newTheme);
  };

  const handleInitiateVerify = (taskId: string, isDone: boolean) => {
    if (isDone) return; 
    if (verifyingTaskId === taskId) {
      setVerifyingTaskId(null);
      setVerifyError('');
    } else {
      setVerifyingTaskId(taskId);
      setVerifyUrl('');
      setVerifyError('');
    }
  };

  const handleConfirmVerify = async (taskId: string) => {
    // 1. X/Social Verifications
    if (taskId === 'post' || taskId === 'echo') {
      if (!verifyUrl.includes('x.com') && !verifyUrl.includes('twitter.com')) {
        setVerifyError('Please paste a valid X/Twitter link.');
        return;
      }
      setIsVerifying(true);
      setVerifyError('');
      
      try {
        const res = await fetch('/api/verify-twitter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: verifyUrl })
        });
        const responseData = await res.json();
        
        if (responseData.success) {
          finalizeTask(taskId, false);
        } else {
          setVerifyError(responseData.error || 'Verification failed. Make sure the tweet is public.');
        }
      } catch (err) {
        setVerifyError('Network error connecting to verification server.');
      }
      setIsVerifying(false);
      
    // 2. Discord Verifications
    } else if (taskId === 'gm') {
      if (!verifyUrl.includes('discord.com/channels/1266746067265916978/1277635543034757130/')) {
        setVerifyError('Invalid link. You must paste a message link from the GM channel.');
        return;
      }
      setIsVerifying(true);
      setVerifyError('');
      setTimeout(() => { finalizeTask(taskId, false); setIsVerifying(false); }, 600);

    } else if (taskId === 'spotlight') {
      if (!verifyUrl.includes('discord.com/channels/1266746067265916978/1285714079087988797/')) {
        setVerifyError('Invalid link. You must paste a message link from the designated Spotlight channel.');
        return;
      }
      setIsVerifying(true);
      setVerifyError('');
      setTimeout(() => { finalizeTask(taskId, true); setIsVerifying(false); }, 600);
    }
  };

  const finalizeTask = (taskId: string, isWeekly: boolean) => {
    const today = getLocalToday();
    const dataStr = localStorage.getItem('fermah-data');
    let data = dataStr ? JSON.parse(dataStr) : null;
    if (!data) return;

    if (isWeekly) {
      data.spotlightDone = true;
      setSpotlightDone(true);
    } else {
      data.dailyTasks[taskId] = true;
      setCompletedDailyTasks(data.dailyTasks);
    }

    // Evaluate Streak ONLY based on daily tasks being done
    const allDailyDone = DAILY_TASKS.every(task => data.dailyTasks[task.id]);

    if (allDailyDone && data.lastStreakDate !== today) {
      data.streak += 1;
      data.lastStreakDate = today;
      setCurrentStreak(data.streak);
    }

    localStorage.setItem('fermah-data', JSON.stringify(data));
    setVerifyingTaskId(null);
    setVerifyUrl('');
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

  const allDailyTasksDone = hydrated && DAILY_TASKS.every(task => completedDailyTasks && completedDailyTasks[task.id]);

  return (
    <div className={`${theme} min-h-screen font-sans`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-10 transition-colors duration-200">
        <header className="flex items-center justify-between pb-8 border-b border-slate-200 dark:border-slate-800 mb-10">
          <div className="flex items-center gap-4">
            <FermahLogoPi className="w-12 h-12" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">
              Fermah <span className="text-sm font-medium text-slate-500 dark:text-slate-500">Terminal</span>
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00C49F] dark:hover:border-[#00C49F] text-lg transition"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </header>

        <main className="max-w-4xl mx-auto space-y-10">
          {hydrated && (
            <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div>
                <h2 className="text-lg font-semibold text-slate-500 dark:text-slate-400">Ecosystem Streak</h2>
                <div className="flex items-center justify-center md:justify-start gap-4">
                    <p className={`text-6xl md:text-7xl font-extrabold tracking-tighter ${allDailyTasksDone ? 'text-[#00C49F]' : ''}`}>
                    🔥 {currentStreak} Days
                    </p>
                </div>
              </div>
              {allDailyTasksDone ? (
                <div className="bg-[#00C49F]/10 text-[#00C49F] px-5 py-3 rounded-xl font-bold border border-[#00C49F]/30 flex items-center gap-2">
                  <span>✅</span> Daily Grid Complete
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-300 max-w-sm text-sm">
                  Lock in your daily tasks to extend the streak. Complete the Boss Quest before Friday or the streak burns.
                </p>
              )}
            </section>
          )}

          {hydrated && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* DAILY GRIND SECTION */}
              <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold tracking-tight">The Daily Grind</h3>
                </div>

                <div className="space-y-4">
                  {DAILY_TASKS.map((task) => {
                    const isChecked = completedDailyTasks && completedDailyTasks[task.id] || false;
                    const isVerifyingThis = verifyingTaskId === task.id;
                    
                    return (
                      <div key={task.id} className="flex flex-col gap-2">
                        <div
                          onClick={() => handleInitiateVerify(task.id, isChecked)}
                          className={`flex items-center gap-5 p-5 rounded-2xl bg-slate-100 dark:bg-slate-950 border transition cursor-pointer ${
                            isChecked 
                              ? 'border-[#00C49F]/50 opacity-80 cursor-not-allowed' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-[#00C49F]/50'
                          }`}
                        >
                          <div className={`text-3xl ${isChecked ? 'grayscale opacity-50' : ''}`}>{task.icon}</div>
                          <label className={`flex-grow text-lg font-medium cursor-pointer ${isChecked ? 'text-slate-500 line-through' : ''}`}>
                            {task.label}
                          </label>
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                              isChecked ? 'bg-[#00C49F] border-[#00C49F]' : 'border-slate-400 dark:border-slate-600'
                            }`}
                          >
                            {isChecked && (
                              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {isVerifyingThis && !isChecked && (
                          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl ml-4 mr-4 flex flex-col gap-3">
                            <p className="text-sm text-slate-500 font-medium">Paste your link to verify:</p>
                            <input 
                              type="url" 
                              placeholder={task.placeholder}
                              value={verifyUrl}
                              onChange={(e) => setVerifyUrl(e.target.value)}
                              className="w-full p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-[#00C49F] text-slate-900 dark:text-white"
                            />
                            {verifyError && <p className="text-sm text-red-500 font-medium">{verifyError}</p>}
                            <button 
                              onClick={() => handleConfirmVerify(task.id)}
                              disabled={isVerifying}
                              className="bg-[#00C49F] text-slate-950 font-bold py-3 px-4 rounded-lg hover:bg-[#00b391] transition disabled:opacity-50"
                            >
                              {isVerifying ? 'Verifying...' : 'Confirm & Lock'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* WEEKLY BOSS QUEST SECTION */}
              <section className="bg-slate-100 dark:bg-slate-900/50 p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-amber-500">Weekly Boss Quest</h3>
                    <p className="text-sm text-slate-500 mt-1">Resets every Friday. Must complete to protect streak.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <div
                      onClick={() => handleInitiateVerify(WEEKLY_TASK.id, spotlightDone)}
                      className={`flex items-center gap-5 p-5 rounded-2xl bg-white dark:bg-slate-950 border shadow-sm transition cursor-pointer ${
                        spotlightDone 
                          ? 'border-amber-500/50 opacity-80 cursor-not-allowed' 
                          : 'border-slate-300 dark:border-slate-600 hover:border-amber-500/50'
                      }`}
                    >
                      <div className={`text-3xl ${spotlightDone ? 'grayscale opacity-50' : ''}`}>{WEEKLY_TASK.icon}</div>
                      <label className={`flex-grow text-lg font-medium cursor-pointer ${spotlightDone ? 'text-slate-500 line-through' : ''}`}>
                        {WEEKLY_TASK.label}
                      </label>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          spotlightDone ? 'bg-amber-500 border-amber-500' : 'border-slate-400 dark:border-slate-600'
                        }`}
                      >
                        {spotlightDone && (
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {verifyingTaskId === WEEKLY_TASK.id && !spotlightDone && (
                      <div className="p-4 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl ml-4 mr-4 flex flex-col gap-3">
                        <p className="text-sm text-slate-500 font-medium">Paste your Fermah Spotlight message link:</p>
                        <input 
                          type="url" 
                          placeholder={WEEKLY_TASK.placeholder}
                          value={verifyUrl}
                          onChange={(e) => setVerifyUrl(e.target.value)}
                          className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                        />
                        {verifyError && <p className="text-sm text-red-500 font-medium">{verifyError}</p>}
                        <button 
                          onClick={() => handleConfirmVerify(WEEKLY_TASK.id)}
                          disabled={isVerifying}
                          className="bg-amber-500 text-slate-950 font-bold py-3 px-4 rounded-lg hover:bg-amber-400 transition disabled:opacity-50"
                        >
                          {isVerifying ? 'Verifying...' : 'Submit Quest & Lock'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
