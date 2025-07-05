
import React, { useState, useEffect, useMemo } from 'react';
import { MarketStatus } from './types';
import { getCurrentStatus, getUpcomingEvents, initializeHolidays } from './services/nyseService';
import { StatusDisplay } from './components/StatusDisplay';
import { EventCard } from './components/EventCard';
import { Clock } from './components/Clock';

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    // Fetch the app version from the main process
    if (window.electronAPI) {
      window.electronAPI.getVersion().then(setAppVersion);
    }

    const init = async () => {
      try {
        await initializeHolidays();
      } catch (e) {
        setError('Could not load holiday data. Market status may be inaccurate.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const { status, holiday } = useMemo(() => {
    if (isLoading) return { status: MarketStatus.CLOSED, holiday: null };
    return getCurrentStatus(currentTime);
  }, [currentTime, isLoading]);

  const upcomingEvents = useMemo(() => {
    if (isLoading) return [];
    return getUpcomingEvents(currentTime);
  }, [currentTime, isLoading]);

  const backgroundStyle = {
    background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)'
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 transition-colors duration-500" style={backgroundStyle}>
       <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
       <div className="relative z-10 w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100">
              NYSE Market Status
            </h1>
            <p className="text-slate-400 mt-2">Live updates from the New York Stock Exchange</p>
        </header>
        
        <main className="flex flex-col items-center gap-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 w-full max-w-lg shadow-2xl border border-slate-700/50">
            {isLoading ? (
               <div className="h-24 flex items-center justify-center">
                <p className="text-slate-400 animate-pulse">Fetching latest holiday data...</p>
               </div>
            ) : (
                <>
                 <div className="mb-6">
                    <StatusDisplay status={status} holiday={holiday} />
                 </div>
                 <Clock time={currentTime} />
                </>
            )}
          </div>
          
          <div className="w-full text-center">
             <h2 className="text-2xl font-semibold text-slate-300 mb-4">Upcoming Events</h2>
              {error && <p className="text-red-400 mb-4">{error}</p>}
             {isLoading ? (
                <div className="text-slate-400">Calculating next events...</div>
             ) : upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingEvents.map((event) => (
                        <EventCard key={event.name} event={event} currentTime={currentTime} />
                    ))}
                </div>
             ) : (
                <div className="bg-slate-800/50 p-6 rounded-xl">
                    <p className="text-slate-400">Could not determine upcoming events. This may occur on weekends or holidays.</p>
                </div>
             )}
          </div>

        </main>

        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>All times are calculated based on your device's clock and standard NYSE hours.</p>
            <p>This is not financial advice. Trading schedules can change.</p>
            {appVersion && <p className="mt-2">Version {appVersion}</p>}
        </footer>
      </div>
    </div>
  );
};

export default App;

