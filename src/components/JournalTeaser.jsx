import { useState } from 'react';
import { CalendarDays, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JournalTeaser() {
  const [entries, setEntries] = useState([
    { date: new Date().toISOString().slice(0, 10), mood: '🙂', note: 'Grateful for a quiet morning.' },
  ]);
  const [note, setNote] = useState('');

  const addEntry = () => {
    if (!note.trim()) return;
    setEntries((e) => [
      { date: new Date().toISOString().slice(0, 10), mood: '🧘', note },
      ...e,
    ]);
    setNote('');
  };

  return (
    <section id="journal" className="py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CalendarDays className="h-6 w-6" /> Journal
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Capture your daily mood with a quick note.</p>

        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur p-4">
          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a short note..."
              className="flex-1 bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button onClick={addEntry} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow hover:opacity-90 transition">
              <PlusCircle className="h-4 w-4" /> Add
            </button>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {entries.map((e, idx) => (
              <motion.div
                key={`${e.date}-${idx}`}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-black/10 dark:border-white/10 p-3 bg-white/70 dark:bg-neutral-800/70"
              >
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{e.date}</span>
                  <span className="text-lg">{e.mood}</span>
                </div>
                <p className="mt-1 text-gray-800 dark:text-gray-100">{e.note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
