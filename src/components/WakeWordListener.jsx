import React, { useEffect, useRef, useState } from 'react';

// Lightweight wake word listener using Web Speech API (where supported).
// It continuously listens for the phrase "hey mindmate" (case-insensitive).
// When detected, it dispatches a CustomEvent "mindmate-wake" and speaks a short chime.
// This is a best-effort, browser-based approach (no cloud processing). It pauses
// when the page is hidden to avoid unnecessary microphone use.

function isSpeechRecognitionAvailable() {
  return (
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  );
}

export default function WakeWordListener() {
  const recRef = useRef(null);
  const [active, setActive] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(!!isSpeechRecognitionAvailable());
  }, []);

  useEffect(() => {
    if (!supported) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    recRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    let started = false;

    const start = () => {
      if (started) return;
      try {
        rec.start();
        started = true;
        setActive(true);
      } catch (e) {
        // start may throw if called too soon; swallow
      }
    };

    const stop = () => {
      try { rec.stop(); } catch {}
      started = false;
      setActive(false);
    };

    const onResult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        transcript += res[0].transcript + ' ';
      }
      const norm = transcript.toLowerCase();
      if (norm.includes('hey mindmate') || norm.includes('heymindmate') || norm.includes('hey, mindmate')) {
        window.dispatchEvent(new CustomEvent('mindmate-wake'));
        // Provide brief audio feedback using speechSynthesis
        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance("I'm listening");
          u.rate = 1.0;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        }
      }
    };

    const onEnd = () => {
      // Auto-restart when visible
      if (!document.hidden) start();
    };

    const onError = () => {
      // Attempt restart next tick
      setTimeout(() => {
        if (!document.hidden) start();
      }, 1200);
    };

    rec.addEventListener('result', onResult);
    rec.addEventListener('end', onEnd);
    rec.addEventListener('error', onError);

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    // Kick off after a short delay to allow page to settle
    const t = setTimeout(() => {
      if (!document.hidden) start();
    }, 600);

    return () => {
      clearTimeout(t);
      document.removeEventListener('visibilitychange', handleVisibility);
      rec.removeEventListener('result', onResult);
      rec.removeEventListener('end', onEnd);
      rec.removeEventListener('error', onError);
      try { rec.stop(); } catch {}
    };
  }, [supported]);

  if (!supported) return null;

  return (
    <div className="fixed right-3 bottom-3 z-40 select-none">
      <div className={`px-3 py-2 rounded-full shadow-md text-xs font-medium backdrop-blur border ${active ? 'bg-emerald-500/20 text-emerald-900 border-emerald-400/50 dark:text-emerald-100' : 'bg-slate-400/20 text-slate-900 border-slate-300/50 dark:text-slate-100'}`}>
        Hey MindMate: {active ? 'listening' : 'idle'}
      </div>
    </div>
  );
}
