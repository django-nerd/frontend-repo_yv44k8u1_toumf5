import { useEffect, useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function useOnlineStatus() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return online;
}

function loadMessages() {
  try {
    const raw = localStorage.getItem('mindmate_chat');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveMessages(msgs) {
  try {
    localStorage.setItem('mindmate_chat', JSON.stringify(msgs));
  } catch {}
}

function generateFriendlyReply(userText) {
  // Close-friend tone, supportive, minimal questions
  const templates = [
    "I hear you. Let's take a slow breath together. I'm with you.",
    "That sounds like a lot. One small step at a time — you’ve got this.",
    "Thanks for sharing that. I’m here, no pressure, just company.",
    "You’re not alone in this. Let’s keep it gentle today.",
    "Proud of you for opening up. Let’s do what feels doable right now.",
    "I’m staying with you. A sip of water and a breath can help.",
  ];

  const softNudges = [
    "If it helps, place a hand on your chest and notice the warmth for a few seconds.",
    "Maybe relax your shoulders and unclench your jaw — I’ll wait with you.",
    "Try a slow inhale for 4, hold 2, exhale for 6. Nice and easy.",
  ];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const base = pick(templates);
  const addNudge = Math.random() > 0.5 ? ` ${pick(softNudges)}` : '';

  // Light personalization without turning it into a question
  const lowered = userText.toLowerCase();
  const tags = [];
  if (lowered.includes('anx') || lowered.includes('worry')) tags.push('You’re safe here.');
  if (lowered.includes('tired') || lowered.includes('exhaust')) tags.push('Rest counts as progress.');
  if (lowered.includes('angry') || lowered.includes('mad')) tags.push('Your feelings make sense.');
  const tag = tags.length ? ` ${pick(tags)}` : '';

  return `${base}${tag}${addNudge}`;
}

export default function ChatPreview() {
  const online = useOnlineStatus();
  const initial = useMemo(() => {
    const stored = loadMessages();
    return (
      stored || [
        { role: 'assistant', content: "Hey, I’m here with you. No rush — we can just take a breath together." },
      ]
    );
  }, []);

  const [messages, setMessages] = useState(initial);
  const [input, setInput] = useState('');

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');

    // Offline-first: generate a friendly local reply immediately
    const reply = generateFriendlyReply(text);
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    }, 450);
  };

  return (
    <section id="chat" className="py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Chat</h2>
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
        <p className="text-gray-600 dark:text-gray-400 mb-4">A gentle, close-friend chat that works even without internet.</p>

        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur p-4">
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
