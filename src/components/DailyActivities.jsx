import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'mindmate_activities';

const QUICK_TAGS = [
  { key: 'exercise', label: 'Exercise 🏃' },
  { key: 'work', label: 'Work 💼' },
  { key: 'study', label: 'Study 📚' },
  { key: 'rest', label: 'Rest 🛌' },
  { key: 'social', label: 'Social 🗣️' },
];

function todayISO(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export default function DailyActivities() {
  const [tags, setTags] = useState([]);
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState([]);

  const todayEntries = useMemo(() => {
    const t = todayISO();
    return entries.filter(e => e.date === t).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  }, [entries]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  }, []);

  const save = (next) => {
    setEntries(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    window.dispatchEvent(new CustomEvent('mindmate-activities-updated'));
  };

  const addEntry = () => {
    if (tags.length === 0 && !note.trim()) return;
    const entry = {
      id: crypto.randomUUID(),
      date: todayISO(),
      tags: [...tags],
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
    save([entry, ...entries]);
    setTags([]);
    setNote('');
  };

  return (
    <div className="rounded-2xl p-6 bg-white/80 dark:bg-white/10 backdrop-blur border border-white/40 shadow-sm">
      <h2 className="text-lg font-semibold">Daily activities</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Tap tags and optionally add a note, then Save.</p>

      <div className="flex flex-wrap gap-2">
        {QUICK_TAGS.map(t => (
          <button
            key={t.key}
            className={`px-3 py-1 rounded-full text-sm border transition ${tags.includes(t.key) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white/60 dark:bg-transparent text-gray-800 dark:text-gray-100 border-gray-300/60 hover:border-gray-400'}`}
            onClick={() => setTags(s => s.includes(t.key) ? s.filter(k=>k!==t.key) : [...s, t.key])}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <input
          value={note}
          onChange={(e)=>setNote(e.target.value)}
          placeholder="Add a quick note (optional)"
          className="w-full rounded-md border bg-white/70 dark:bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={addEntry} className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700">Save</button>
        <button onClick={()=>{setTags([]);setNote('');}} className="px-3 py-2 rounded-md border text-sm">Clear</button>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Today</h3>
        <div className="space-y-2">
          {todayEntries.length === 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-300">No entries yet.</div>
          )}
          {todayEntries.map(item => (
            <div key={item.id} className="flex items-start justify-between rounded-md border bg-white/70 dark:bg-white/5 px-3 py-2">
              <div>
                <div className="flex flex-wrap gap-1 text-xs">
                  {item.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200/60">{t}</span>
                  ))}
                </div>
                {item.note && <div className="text-sm mt-1">{item.note}</div>}
              </div>
              <div className="text-xs text-gray-500 ml-3 whitespace-nowrap">
                {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
