
import React from 'react';

interface ClockProps {
  time: Date;
}

const formatTime = (date: Date, timeZone: string): string => {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
    hour12: false,
    timeZone: timeZone,
  }).format(date);
};

export const Clock: React.FC<ClockProps> = ({ time }) => {
  return (
    <div className="flex justify-center items-center gap-6 text-center text-slate-300">
      <div>
        <p className="text-lg font-semibold">{formatTime(time, 'Europe/Berlin')}</p>
        <p className="text-xs text-slate-400">Your Time (CET/CEST)</p>
      </div>
      <div className="w-px h-10 bg-slate-600"></div>
      <div>
        <p className="text-lg font-semibold">{formatTime(time, 'America/New_York')}</p>
        <p className="text-xs text-slate-400">NYSE Time (ET/EDT)</p>
      </div>
    </div>
  );
};

