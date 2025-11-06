export default function Footer() {
  return (
    <footer className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          © {new Date().getFullYear()} MindMate — An AI-powered mental wellness companion. Built as a PWA-ready concept with offline-first thinking.
        </p>
      </div>
    </footer>
  );
}
