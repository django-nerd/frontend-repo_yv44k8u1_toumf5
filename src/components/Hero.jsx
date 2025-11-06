import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-[80vh] w-full grid place-items-center overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/80 dark:from-neutral-950/60 dark:via-neutral-950/40 dark:to-neutral-950/80 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center px-6"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-purple-500 via-blue-500 to-amber-500 bg-clip-text text-transparent">
          MindMate
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          Your AI-powered mental wellness companion. Journaling, mindful chats, and gentle reminders—online or offline.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="#chat" className="px-5 py-3 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-lg hover:opacity-90 transition">Start Chat</a>
          <a href="#journal" className="px-5 py-3 rounded-xl bg-white/70 dark:bg-neutral-800/70 text-gray-900 dark:text-gray-100 border border-black/10 dark:border-white/10 hover:bg-white/90 dark:hover:bg-neutral-800 transition">Open Journal</a>
        </div>
      </motion.div>
    </section>
  );
}
