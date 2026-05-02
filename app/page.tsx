'use client';

import { useState, useEffect } from 'react';

const DAILY_TASKS = [
  { id: 'post', label: 'Post Content (X/Social)', icon: '📝' },
  { id: 'discord', label: 'Check Discord (Community)', icon: '💬' },
  { id: 'spotlight', label: 'Submit to Spotlight', icon: '🌟' },
  { id: 'engage', label: 'Engage with 3+ Posts', icon: '🤝' },
];

const getLocalToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function FermahTracker() {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [hydrated, setHydrated] = useState(false);
  
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verifyUrl, setVerifyUrl] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    const storedTheme = localStorage.getItem('fermah-theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === 'dark') document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('dark');
    }

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
        data.streak = 0;
      }

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

  const handleInitiateVerify = (taskId: string) => {
    if (completedTasks[taskId]) return; 
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
    if (taskId === 'post') {
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
        
        const data = await res.json();
        
        if (data.success) {
          finalizeTask(taskId);
        } else {
          setVerifyError(data.error || 'Verification failed. Make sure the tweet is public.');
        }
      } catch (err) {
        setVerifyError('Network error connecting to verification server.');
      }
      setIsVerifying(false);
      
    } else if (taskId === 'discord') {
      // The Ultimate Content Channel Lock
      const fermahServerId = '1266746067265916978';
      const fermahContentChannelId = '1285714079087988797';
      
      if (!verifyUrl.includes(`discord.com/channels/${fermahServerId}/${fermahContentChannelId}/`)) {
        setVerifyError('Invalid link. You must paste a message link from the designated content channel.');
        return;
      }

      setIsVerifying(true);
      setVerifyError('');
      
      setTimeout(() => {
        finalizeTask(taskId);
        setIsVerifying(false);
      }, 600);

    } else {
      finalizeTask(taskId);
    }
  };

  const finalizeTask = (taskId: string) => {
    const today = getLocalToday();
    const dataStr = localStorage.getItem('fermah-data');
    let data = dataStr ? JSON.parse(dataStr) : { lastCheckIn: today, tasks: {}, streak: 0, lastStreakDate: '' };

    data.tasks[taskId] = true;
    setCompletedTasks(data.tasks);

    const todayFinished = DAILY_TASKS.every(task => data.tasks[task.id]);

    if (todayFinished && data.lastStreakDate !== today) {
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
                  const isVerifyingThis = verifyingTaskId === task.id;
                  
                  return (
                    <div key={task.id} className="flex flex-col gap-2">
                      <div
                        onClick={() => handleInitiateVerify(task.id)}
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
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl ml-4 mr-4 flex flex-col gap-3 animate-in slide-in-from-top-2">
                          <p className="text-sm text-slate-500 font-medium">
                            {task.id === 'post' ? 'Paste the link to your X post to verify:' : 
                             task.id === 'discord' ? 'Paste your Fermah Discord message link:' : 
                             'Mark this task as complete?'}
                          </p>
                          
                          {(task.id === 'post' || task.id === 'discord') && (
                            <input 
                              type="url" 
                              placeholder={task.id === 'post' ? "https://x.com/yourhandle/status/..." : "https://discord.com/channels/1266746067265916978/1285714079087988797/..."}
                              value={verifyUrl}
                              onChange={(e) => setVerifyUrl(e.target.value)}
                              className="w-full p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-[#00C49F] text-slate-900 dark:text-white"
                            />
                          )}

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
          )}
        </main>
      </div>
    </div>
  );
}
