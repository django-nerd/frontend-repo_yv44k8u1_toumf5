import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Plus, CalendarCheck2, Sun, Moon, Sunset } from 'lucide-react';
import { motion } from 'framer-motion';

const STORAGE_KEY = 'mindmate_activities';

function loadAllActivities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveAllActivities(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('mindmate-activities-updated'));
  } catch {}
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const QUICK = [
  'Workout',
  'Walk',
  'Meditation',
  'Work',
  'Study',
  'Social',
  'Chores',
  'Rest',
];

function getDaypartFromHour(hour) {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export default function DailyActivities() {
  const [note, setNote] = useState('');
  const [selected, setSelected] = useState([]);
  const [items, setItems] = useState(() => loadAllActivities());

  const todays = useMemo(
    () => items.filter((i) => i.date === todayStr()),
    [items]
  );

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setItems(loadAllActivities());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleQuick = (q) => {
    setSelected((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]
    );
  };

  const add = () => {
    if (selected.length === 0 && !note.trim()) return;
    const entry = {
      id: crypto.randomUUID(),
      date: todayStr(),
      tags: selected,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...items];
    setItems(next);
    saveAllActivities(next);
    setSelected([]);
    setNote('');
  };

  return (
    <section id="activities" className="py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6" /> Daily Activities
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Log what you did today. Your chat will gently reflect your day, and the layout adapts with time.</p>

        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => toggleQuick(q)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  selected.includes(q)
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent'
                    : 'bg-white/70 dark:bg-neutral-800/70 text-gray-800 dark:text-gray-200 border-black/10 dark:border-white/10 hover:bg-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a short note (optional)"
              className="flex-1 bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              onClick={add}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow hover:opacity-90 transition"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {todays.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">No activities yet today. Add a couple — even small things count.</p>
            )}
            {todays.map((a) => {
              const hour = new Date(a.createdAt).getHours();
              const dp = getDaypartFromHour(hour);
              const badge = dp === 'morning' ? <Sun className="h-4 w-4"/> : dp === 'afternoon' ? <Sunset className="h-4 w-4"/> : dp === 'evening' ? <Sunset className="h-4 w-4"/> : <Moon className="h-4 w-4"/>;
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl border border-black/10 dark:border-white/10 p-3 bg-white/70 dark:bg-neutral-800/70"
                >
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center gap-2">{badge} {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle2 className="h-4 w-4" /> logged</span>
                  </div>
                  <div className="mt-1 text-gray-800 dark:text-gray-100">
                    {a.tags.length > 0 && (
                      <div className="mb-1 flex flex-wrap gap-1">
                        {a.tags.map((t) => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">{t}</span>
                        ))}
                      </div>
                    )}
                    {a.note && <p className="text-sm">{a.note}</p>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
