import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ChatPreview from './components/ChatPreview';
import JournalTeaser from './components/JournalTeaser';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navbar />
      <main>
        <Hero />
        <ChatPreview />
        <JournalTeaser />
        <section id="settings" className="py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
            <p className="text-gray-600 dark:text-gray-400">
              This demo showcases the look and feel of MindMate with theme toggle, animated hero, chat preview, and journal entries.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;
