
import React, { useState, useEffect } from 'react';
import { MarketEvent } from '../types';

interface EventCardProps {
  event: MarketEvent;
  currentTime: Date;
}

const formatEventTime = (date: Date, timeZone: string) => {
    return new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
        hour12: false,
        timeZone: timeZone,
    }).format(date);
};

const Countdown: React.FC<{ targetDate: Date; currentTime: Date }> = ({ targetDate, currentTime }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const diff = targetDate.getTime() - currentTime.getTime();

    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  }, [currentTime, targetDate]);

  const pad = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="font-mono text-4xl lg:text-5xl font-bold tracking-tight text-white">
      {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
      <span>{pad(timeLeft.hours)}</span>
      <span className="animate-pulse">:</span>
      <span>{pad(timeLeft.minutes)}</span>
      <span className="animate-pulse">:</span>
      <span>{pad(timeLeft.seconds)}</span>
    </div>
  );
};


export const EventCard: React.FC<EventCardProps> = ({ event, currentTime }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 w-full shadow-lg border border-slate-700/50">
      <h3 className="text-xl font-bold text-sky-300 mb-2">{event.name}</h3>
      <div className="mb-4">
        <p className="text-lg text-slate-100">{formatEventTime(event.dateTime, 'Europe/Berlin')}</p>
        <p className="text-sm text-slate-400">({formatEventTime(event.dateTime, 'America/New_York')})</p>
      </div>
      <Countdown targetDate={event.dateTime} currentTime={currentTime} />
    </div>
  );
};

