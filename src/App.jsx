import React, { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import DailyActivities from './components/DailyActivities.jsx';
import ActivityAwareChat from './components/ActivityAwareChat.jsx';
import WakeWordListener from './components/WakeWordListener.jsx';

function getLastActivity() {
  try {
    const raw = localStorage.getItem('mindmate_activities');
    if (!raw) return null;
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) return null;
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  } catch {
    return null;
  }
}

function deriveDaypart(date = new Date()) {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

function daypartClasses(part) {
  switch (part) {
    case 'morning':
      return 'from-amber-200 via-rose-100 to-sky-100';
    case 'afternoon':
      return 'from-sky-200 via-indigo-100 to-teal-100';
    case 'evening':
      return 'from-orange-200 via-pink-100 to-purple-200';
    default:
      return 'from-slate-900 via-slate-800 to-indigo-900';
  }
}

function daypartEmoji(part) {
  switch (part) {
    case 'morning':
      return '🌅';
    case 'afternoon':
      return '🌤️';
    case 'evening':
      return '🌇';
    default:
      return '🌙';
  }
}

export default function App() {
  const [lastActivity, setLastActivity] = useState(getLastActivity());

  useEffect(() => {
    const onUpdate = () => setLastActivity(getLastActivity());
    window.addEventListener('mindmate-activities-updated', onUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === 'mindmate_activities') onUpdate();
    });
    return () => {
      window.removeEventListener('mindmate-activities-updated', onUpdate);
    };
  }, []);

  const daypart = useMemo(() => {
    const ref = lastActivity?.createdAt ? new Date(lastActivity.createdAt) : new Date();
    return deriveDaypart(ref);
  }, [lastActivity]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${daypartClasses(daypart)} transition-colors duration-500`}> 
      <WakeWordListener />
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-slate-800/60 rounded-full px-3 py-1 shadow-sm">
            <span className="mr-2">{daypartEmoji(daypart)}</span>
            <span className="capitalize">Good {daypart}</span>
          </div>
          <div className="text-xs text-slate-600/80 dark:text-slate-300/80">
            Say “Hey MindMate” to start speaking hands‑free
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyActivities />
          <ActivityAwareChat />
        </div>
      </div>
    </div>
  );
}
