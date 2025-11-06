import { useEffect, useMemo, useState } from 'react';
import { Send, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CHAT_KEY = 'mindmate_chat';
const ACT_KEY = 'mindmate_activities';

function useOnlineStatus() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function summarizeTodayActivities(list) {
  const today = new Date().toISOString().slice(0, 10);
  const todays = list.filter((i) => i.date === today);
  if (todays.length === 0) return null;
  const tags = Array.from(new Set(todays.flatMap((i) => i.tags || [])));
  const note = todays.find((i) => i.note)?.note;
  return { tags, note };
}

function friendlyReply(userText, activitiesSummary) {
  const baseTemplates = [
    "I’m here with you. Let’s keep it gentle.",
    "Thanks for sharing — one small step is enough.",
    "I’m proud of you for showing up. We’ll take it slow.",
  ];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  let base = pick(baseTemplates);

  // Personalize with activities
  if (activitiesSummary) {
    const { tags = [], note } = activitiesSummary;
    if (tags.includes('Workout') || tags.includes('Walk')) {
      base += ' Your body got some movement today — nice job.';
    }
    if (tags.includes('Meditation')) {
      base += ' That moment of stillness can really support you.';
    }
    if (tags.includes('Work') || tags.includes('Study')) {
      base += ' You showed up for your responsibilities; that counts.';
    }
    if (tags.includes('Social')) {
      base += ' Connection can be nourishing — even small moments.';
    }
    if (tags.includes('Rest')) {
      base += ' Rest is productive; I’m glad you listened to your energy.';
    }
    if (note) {
      base += ' I remember you noted: "' + note.slice(0, 120) + (note.length > 120 ? '…' : '') + '"';
    }
  }

  // Lightly respond to tone
  const t = userText.toLowerCase();
  if (t.includes('tired') || t.includes('exhaust')) base += ' Let’s keep things easy — breathing and soft focus.';
  if (t.includes('anx') || t.includes('worry')) base += ' You’re safe here. I’m with you.';
  if (t.includes('sad') || t.includes('down')) base += ' Your feelings matter, and I’m holding space for them.';

  return base;
}

export default function ActivityAwareChat() {
  const online = useOnlineStatus();
  const [messages, setMessages] = useState(() => load(CHAT_KEY, [
    { role: 'assistant', content: 'Hey, I’m here. Want to settle in together for a moment?' },
  ]));
  const [input, setInput] = useState('');
  const [activities, setActivities] = useState(() => load(ACT_KEY, []));

  const summary = useMemo(() => summarizeTodayActivities(activities), [activities]);

  useEffect(() => {
    save(CHAT_KEY, messages);
  }, [messages]);

  useEffect(() => {
    // Live updates when activities change elsewhere
    const update = () => setActivities(load(ACT_KEY, []));
    window.addEventListener('mindmate-activities-updated', update);
    const onStorage = (e) => { if (e.key === ACT_KEY) update(); };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('mindmate-activities-updated', update);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');

    const reply = friendlyReply(text, summary);
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    }, 420);
  };

  return (
    <section id="chat" className="py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"><Activity className="h-5 w-5"/> Activity-Aware Chat</h2>
          <span
            className={`inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full border ${
              online
                ? 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20'
                : 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
            }`}
            title={online ? 'Online' : 'Offline — messages are saved locally'}
          >
            <span className={`h-2 w-2 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`} />
            {online ? 'Online' : 'Offline'}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Replies gently reflect what you logged today.</p>

        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur p-4">
          {summary && (
            <div className="mb-3 text-xs text-gray-700 dark:text-gray-300">
              <span className="font-medium">Today:</span>{' '}
              {summary.tags && summary.tags.length > 0 ? summary.tags.join(', ') : '—'}
              {summary.note ? ` — “${summary.note.slice(0, 60)}${summary.note.length > 60 ? '…' : ''}”` : ''}
            </div>
          )}
          <div className="h-64 overflow-y-auto space-y-3 pr-1">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    m.role === 'user'
                      ? 'ml-auto bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-gray-100'
                  }`}
                >
                  {m.content}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type a message..."
              className="flex-1 bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              onClick={send}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-tr from-purple-500 via-blue-500 to-amber-500 text-white shadow hover:opacity-90 transition"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
          {!online && (
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">You’re offline. Your chat is saved on this device and will be here when you’re back online.</p>
          )}
        </div>
      </div>
    </section>
  );
}
