import { useEffect, useState } from 'react';
import { Home, MessageCircle, Notebook, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const links = [
  { label: 'Home', href: '#home', icon: Home },
  { label: 'Chat', href: '#chat', icon: MessageCircle },
  { label: 'Journal', href: '#journal', icon: Notebook },
  { label: 'Settings', href: '#settings', icon: Settings },
];

export default function Navbar() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-neutral-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/60"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-500 via-blue-500 to-amber-400 shadow-lg" />
          <span className="font-semibold text-lg tracking-tight text-gray-900 dark:text-gray-100">MindMate</span>
        </a>
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
            >
              <Icon className="h-4 w-4" /> {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow hover:opacity-90 transition"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </motion.header>
  );
}
