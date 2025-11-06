import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Activity, Mic, Square, Volume2, VolumeX } from 'lucide-react';
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
  return { tags, note, count: todays.length, all: todays };
}

function pickEmojiFromSummaryAndText(summary, userText) {
  const emojis = [];
  const t = (userText || '').toLowerCase();
  const tags = summary?.tags || [];
  if (tags.includes('Workout') || tags.includes('Walk')) emojis.push('💪');
  if (tags.includes('Meditation')) emojis.push('🧘');
  if (tags.includes('Work') || tags.includes('Study')) emojis.push('📚');
  if (tags.includes('Social')) emojis.push('🤝');
  if (tags.includes('Rest')) emojis.push('😴');
  if (t.includes('tired') || t.includes('sleep')) emojis.push('😴');
  if (t.includes('anx') || t.includes('worry') || t.includes('stress')) emojis.push('🫶');
  if (t.includes('happy') || t.includes('good')) emojis.push('😊');
  if (t.includes('sad') || t.includes('down')) emojis.push('💙');
  const unique = Array.from(new Set(emojis));
  return unique.slice(0, 2).join(' ');
}

function buildDetails(summary) {
  if (!summary) return 'I don’t have any activities for today yet. You can add a couple and I’ll summarize them here.';
  const parts = [];
  const tagText = summary.tags.length > 0 ? summary.tags.join(', ') : 'no tags logged';
  parts.push(`You logged ${summary.count} entr${summary.count === 1 ? 'y' : 'ies'} today: ${tagText}.`);
  if (summary.note) parts.push(`Your note: "${summary.note}"`);
  const last = summary.all.slice().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))[0];
  if (last) parts.push(`Most recent at ${new Date(last.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`);
  return parts.join(' ');
}

function detectIntent(userText) {
  const t = (userText || '').toLowerCase();
  if (/what (did|have) i do( today)?/.test(t) || t.includes('summary') || t.includes('details') || t.includes('show my activities') || t.includes('list my activities')) {
    return 'details';
  }
  return 'chat';
}

function friendlyReply(userText, activitiesSummary) {
  // Intent: details
  if (detectIntent(userText) === 'details') {
    return buildDetails(activitiesSummary);
  }

  const baseTemplates = [
    'I’m here with you. Let’s keep it gentle.',
    'Thanks for sharing — one small step is enough.',
    'I’m proud of you for showing up. We’ll take it slow.',
  ];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  let base = pick(baseTemplates);

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

  const t = userText.toLowerCase();
  if (t.includes('tired') || t.includes('exhaust')) base += ' Let’s keep things easy — breathing and soft focus.';
  if (t.includes('anx') || t.includes('worry')) base += ' You’re safe here. I’m with you.';
  if (t.includes('sad') || t.includes('down')) base += ' Your feelings matter, and I’m holding space for them.';

  const emoji = pickEmojiFromSummaryAndText(activitiesSummary, userText);
  if (emoji) base += ` ${emoji}`;
  return base;
}

export default function ActivityAwareChat() {
  const online = useOnlineStatus();
  const [messages, setMessages] = useState(() => load(CHAT_KEY, [
    { role: 'assistant', content: 'Hey, I’m here. Want to settle in together for a moment?' },
  ]));
  const [input, setInput] = useState('');
  const [activities, setActivities] = useState(() => load(ACT_KEY, []));
  const [listening, setListening] = useState(false);
  const [voiceReply, setVoiceReply] = useState(true);
  const recRef = useRef(null);

  const summary = useMemo(() => summarizeTodayActivities(activities), [activities]);

  useEffect(() => {
    save(CHAT_KEY, messages);
  }, [messages]);

  useEffect(() => {
    const update = () => setActivities(load(ACT_KEY, []));
    window.addEventListener('mindmate-activities-updated', update);
    const onStorage = (e) => { if (e.key === ACT_KEY) update(); };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('mindmate-activities-updated', update);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  function speak(text) {
    try {
      if (!voiceReply || !('speechSynthesis' in window)) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1;
      utter.pitch = 1;
      utter.lang = 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch {}
  }

  const send = (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');

    const reply = friendlyReply(text, summary);
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
      speak(reply);
    }, 380);
  };

  const startListening = () => {
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return alert('Voice recognition is not supported in this browser.');
      const rec = new SR();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0]?.transcript).join(' ').trim();
        if (transcript) {
          setInput(transcript);
          send(transcript);
        }
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recRef.current = rec;
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const stopListening = () => {
    try {
      recRef.current?.stop();
    } catch {}
    setListening(false);
  };

  return (
    <section id="chat" className="py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"><Activity className="h-5 w-5"/> Activity-Aware Chat</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceReply(v => !v)}
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition ${voiceReply ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20' : 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20'}`}
              title={voiceReply ? 'Voice replies on' : 'Voice replies off'}
            >
              {voiceReply ? <Volume2 className="h-4 w-4"/> : <VolumeX className="h-4 w-4"/>}
              {voiceReply ? 'Voice: On' : 'Voice: Off'}
            </button>
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
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Speak or type. I’ll respond with empathetic text, emojis, and voice.</p>

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
            <button
              onClick={listening ? stopListening : startListening}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition ${listening ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-100 border-black/10 dark:border-white/10'}`}
              title={listening ? 'Stop voice input' : 'Start voice input'}
            >
              {listening ? <Square className="h-4 w-4"/> : <Mic className="h-4 w-4"/>}
              {listening ? 'Stop' : 'Speak'}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type a message or use voice…"
              className="flex-1 bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              onClick={() => send()}
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
