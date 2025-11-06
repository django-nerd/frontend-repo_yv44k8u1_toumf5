import { useState } from 'react';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPreview() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! How are you feeling today?' },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: "I'm here with you. Want to try a quick grounding exercise?" },
      ]);
    }, 500);
  };

  return (
    <section id="chat" className="py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Chat</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">A lightweight preview of the MindMate assistant.</p>

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
        </div>
      </div>
    </section>
  );
}
