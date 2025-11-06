import React, { useMemo } from 'react';
import WakeWordListener from './components/WakeWordListener.jsx';
import DaypartBanner from './components/DaypartBanner.jsx';
import DailyActivities from './components/DailyActivities.jsx';
import ActivityAwareChat from './components/ActivityAwareChat.jsx';

function deriveDaypart(date = new Date()) {
  const h = date.getHours();
  if (h >= 5 && h <= 11) return 'morning';
  if (h >= 12 && h <= 16) return 'afternoon';
  if (h >= 17 && h <= 20) return 'evening';
  return 'night';
}

const daypartConfig = {
  morning: {
    emoji: '🌅',
    gradient: 'from-orange-100 via-rose-100 to-amber-100',
  },
  afternoon: {
    emoji: '🌤️',
    gradient: 'from-sky-100 via-cyan-100 to-emerald-100',
  },
  evening: {
    emoji: '🌇',
    gradient: 'from-amber-100 via-orange-100 to-pink-100',
  },
  night: {
    emoji: '🌙',
    gradient: 'from-slate-900 via-slate-800 to-slate-900',
  },
};

export default function App() {
  const part = useMemo(() => deriveDaypart(), []);
  const cfg = daypartConfig[part];

  return (
    <div className={`min-h-screen w-full bg-gradient-to-b ${cfg.gradient} transition-colors`}> 
      <div className="max-w-6xl mx-auto px-4 py-8">
        <DaypartBanner emoji={cfg.emoji} part={part} />

        <div className="mt-6 text-sm text-gray-600 dark:text-gray-300">
          Tip: You can just say “Hey MindMate” to start speaking hands‑free.
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyActivities />
          <ActivityAwareChat />
        </div>
      </div>

      {/* Background wake‑word listener with tiny indicator */}
      <WakeWordListener />
    </div>
  );
}
