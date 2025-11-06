import React, { useEffect, useRef, useState } from 'react';

// WakeWordListener: lightweight continuous listener for the phrase "hey mindmate".
// On detection, it dispatches a CustomEvent("mindmate-wake") on window and gives a short audio cue.
export default function WakeWordListener() {
  const recognitionRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return; // Unsupported

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    let stoppedByVisibility = false;

    const start = () => {
      try {
        recognition.start();
        setActive(true);
      } catch {
        // start may throw if already started
      }
    };

    const stop = () => {
      try {
        recognition.stop();
      } catch {}
      setActive(false);
    };

    const handleResult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase();
        if (transcript.includes('hey mindmate') || transcript.includes('hey, mindmate')) {
          window.dispatchEvent(new CustomEvent('mindmate-wake'));
          // Provide a short listening cue using speech synthesis since this is a voice interaction
          const utter = new SpeechSynthesisUtterance("I'm listening");
          try { window.speechSynthesis.cancel(); } catch {}
          try { window.speechSynthesis.speak(utter); } catch {}
        }
      }
    };

    const handleEnd = () => {
      // Auto-restart if still visible
      if (!document.hidden) {
        setTimeout(() => start(), 400);
      } else {
        setActive(false);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stoppedByVisibility = true;
        stop();
      } else if (stoppedByVisibility) {
        stoppedByVisibility = false;
        start();
      }
    };

    recognition.addEventListener('result', handleResult);
    recognition.addEventListener('end', handleEnd);
    document.addEventListener('visibilitychange', handleVisibility);

    start();

    return () => {
      recognition.removeEventListener('result', handleResult);
      recognition.removeEventListener('end', handleEnd);
      document.removeEventListener('visibilitychange', handleVisibility);
      stop();
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 pointer-events-none select-none">
      <div className={`px-2 py-1 rounded-full text-xs shadow-md transition-colors ${active ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Wake word {active ? 'on' : 'off'}</div>
    </div>
  );
}
