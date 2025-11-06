import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ActivityAwareChat from './components/ActivityAwareChat';
import DailyActivities from './components/DailyActivities';

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navbar />
      <main>
        <Hero />
        <DailyActivities />
        <ActivityAwareChat />
      </main>
    </div>
  );
}

export default App;
