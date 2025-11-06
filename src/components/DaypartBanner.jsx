import React from 'react';

export default function DaypartBanner({ emoji, part }) {
  const greeting = {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    night: 'Good night',
  }[part] || 'Hello';

  return (
    <div className="w-full rounded-2xl p-6 bg-white/70 dark:bg-white/10 backdrop-blur border border-white/40 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>{emoji}</span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{greeting}, MindMate</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Track your day and chat with context-aware replies.</p>
        </div>
      </div>
    </div>
  );
}
