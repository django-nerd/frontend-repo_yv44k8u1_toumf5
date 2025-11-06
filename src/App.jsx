import { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ActivityAwareChat from './components/ActivityAwareChat';
import DailyActivities from './components/DailyActivities';

const ACT_KEY = 'mindmate_activities';

function loadActivities() {
  try {
    const raw = localStorage.getItem(ACT_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function getDaypartFromHour(hour) {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function deriveDaypart(activities) {
  // Prefer most recent activity time; fallback to current time
  const last = activities && activities.length > 0
    ? activities.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;
  const dt = last ? new Date(last.createdAt) : new Date();
  return getDaypartFromHour(dt.getHours());
}

function daypartClasses(dp) {
  switch (dp) {
    case 'morning':
      return 'from-amber-100 via-sky-100 to-white dark:from-amber-950/40 dark:via-sky-950/30 dark:to-neutral-950';
    case 'afternoon':
      return 'from-blue-50 via-violet-50 to-white dark:from-blue-950/30 dark:via-violet-950/30 dark:to-neutral-950';
    case 'evening':
      return 'from-purple-50 via-pink-50 to-white dark:from-purple-950/30 dark:via-pink-950/30 dark:to-neutral-950';
    case 'night':
    default:
      return 'from-neutral-900 via-neutral-950 to-black dark:from-neutral-900 dark:via-neutral-950 dark:to-black';
  }
}

function daypartEmoji(dp) {
  return dp === 'morning' ? '🌅' : dp === 'afternoon' ? '🌤️' : dp === 'evening' ? '🌇' : '🌙';
}

export default function App() {
  const [activities, setActivities] = useState(() => loadActivities());
  const daypart = useMemo(() => deriveDaypart(activities), [activities]);

  useEffect(() => {
    const sync = () => setActivities(loadActivities());
    window.addEventListener('mindmate-activities-updated', sync);
    window.addEventListener('storage', (e) => {
      if (e.key === ACT_KEY) sync();
    });
    return () => {
      window.removeEventListener('mindmate-activities-updated', sync);
    };
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${daypartClasses(daypart)} transition-colors`}> 
      <Navbar />
      <main>
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mt-3 mb-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur px-4 py-2 flex items-center gap-3">
              <span className="text-xl" role="img" aria-label="daypart">{daypartEmoji(daypart)}</span>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                Your layout adapts to your day — right now it feels like <span className="font-semibold capitalize">{daypart}</span>.
              </p>
            </div>
          </div>
          <Hero />
        </section>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <DailyActivities />
          <ActivityAwareChat />
        </div>
      </main>
    </div>
  );
}
