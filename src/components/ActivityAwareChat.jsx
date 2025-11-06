import React, { useEffect, useMemo, useRef, useState } from 'react';

const CHAT_KEY = 'mindmate_chat';
const ACTIVITY_KEY = 'mindmate_activities';

function todayISO(d = new Date()) { return d.toISOString().slice(0, 10); }

function useLocalStorageArray(key, initial = []) {
  const [data, setData] = useState(initial);
  useEffect(() => {
    try { const raw = localStorage.getItem(key); if (raw) setData(JSON.parse(raw)); } catch {}
  }, [key]);
  const save = (next) => { setData(next); try { localStorage.setItem(key, JSON.stringify(next)); } catch {} };
  return [data, save];
}

export default function ActivityAwareChat() {
  const [chat, setChat] = useLocalStorageArray(CHAT_KEY, []);
  const [activities] = useLocalStorageArray(ACTIVITY_KEY, []);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  // Summarize today's activities briefly
  const todaySummary = useMemo(() => {
    const t = todayISO();
    const list = activities.filter(a => a.date === t);
    if (list.length === 0) return 'No activities logged yet today.';
    const tagCounts = list.flatMap(a => a.tags).reduce((acc, t) => (acc[t]=(acc[t]||0)+1, acc), {});
    const parts = Object.entries(tagCounts).map(([k,v])=>`${k} x${v}`);
    return `Today: ${parts.join(', ')}${list.some(a=>a.note) ? ' + notes.' : '.'}`;
  }, [activities]);

  // Web Speech API for chat input only (distinct from wake-word listener)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const r = new SpeechRecognition();
    r.continuous = false;
    r.interimResults = true;
    r.lang = 'en-US';
    recognitionRef.current = r;

    let interim = '';

    const start = () => {
      try { r.start(); setListening(true); } catch {}
    };
    const stop = () => { try { r.stop(); } catch {}; setListening(false); };

    r.onresult = (e) => {
      let final = '';
      interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      if (interim) setInput(interim);
      if (final) {
        setInput('');
        stop();
        // Auto-respond when voice captures a final transcript
        respond(final, /*fromVoice*/ true);
      }
    };
    r.onend = () => setListening(false);

    const onWake = () => start();
    window.addEventListener('mindmate-wake', onWake);
    return () => {
      window.removeEventListener('mindmate-wake', onWake);
      try { r.abort(); } catch {}
    };
  }, []);

  const speakIfAllowed = (text, fromVoice) => {
    // Respect: don't speak while texting; only speak when the user spoke
    if (!fromVoice) return;
    try { window.speechSynthesis.cancel(); } catch {}
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(u);
  };

  const BASE = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '') || (window.location.origin.replace(':3000', ':8000'));

  const fetchInstantAnswer = async (q) => {
    try {
      const res = await fetch(`${BASE}/api/answer?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`Bad status ${res.status}`);
      const data = await res.json();
      return data;
    } catch (e) {
      return { answer: null, source_url: null, error: e.message };
    }
  };

  const respond = async (message, fromVoice = false) => {
    const lower = message.toLowerCase();
    let reply = '';
    let source = null;

    if (lower.includes('what did i do') || lower.includes('summary')) {
      reply = `Here's your day so far: ${todaySummary} 😊`;
    } else if (lower.includes('details')) {
      reply = `Details for today:\n- ${todaySummary}\n- Energy: consider hydration and a short walk. 🚶`;
    } else {
      // General questions → try web instant answer via backend
      const web = await fetchInstantAnswer(message);
      if (web && web.answer) {
        reply = `${web.answer}${web.source_url ? `\nSource: ${web.source_url}` : ''}`;
        source = web.source_url || null;
      } else {
        reply = `I couldn't find a concise answer right now. Try rephrasing or ask for a summary. 🔎`;
      }
    }

    const next = [...chat, { role: 'user', content: message }, { role: 'assistant', content: reply }];
    setChat(next);
    speakIfAllowed(reply, fromVoice);
  };

  const onSend = async () => {
    const msg = input.trim();
    if (!msg) return;
    setInput('');
    await respond(msg, /*fromVoice*/ false);
  };

  return (
    <div className="rounded-2xl p-6 bg-white/80 dark:bg-white/10 backdrop-blur border border-white/40 shadow-sm flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Chat</h2>
        <div className="flex items-center gap-2 text-xs">
          <span className={`px-2 py-0.5 rounded-full ${listening ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-800'}`}>{listening ? 'Listening…' : 'Idle'}</span>
          <button onClick={()=>{ try{recognitionRef.current && recognitionRef.current.start(); setListening(true);}catch{} }} className="px-2 py-1 rounded border">Speak</button>
          <button onClick={()=>{ try{recognitionRef.current && recognitionRef.current.stop(); setListening(false);}catch{} }} className="px-2 py-1 rounded border">Stop</button>
        </div>
      </div>

      <div className="mt-3 flex-1 min-h-[200px] overflow-auto space-y-2">
        {chat.length === 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-300">Ask about your day, or anything on the web. Try “What is intermittent fasting?”</div>
        )}
        {chat.map((m, i) => (
          <div key={i} className={`px-3 py-2 rounded-md max-w-[85%] ${m.role==='user' ? 'bg-emerald-600 text-white self-end ml-auto' : 'bg-white border'}`}>
            {m.content}
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          onKeyDown={(e)=>{ if (e.key==='Enter') onSend(); }}
          placeholder="Type a message or say “Hey MindMate” to dictate"
          className="flex-1 rounded-md border bg-white/70 dark:bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button onClick={onSend} className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700">Send</button>
      </div>
    </div>
  );
}
