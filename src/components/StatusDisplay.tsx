import React from 'react';
import { MarketStatus } from '../types';

interface StatusDisplayProps {
  status: MarketStatus;
  holiday: string | null;
}

const statusConfig = {
  [MarketStatus.OPEN]: {
    text: "Market is Open",
    color: "bg-emerald-500",
    shadow: "shadow-emerald-500/50",
  },
  [MarketStatus.PREMARKET]: {
    text: "Premarket Trading",
    color: "bg-sky-500",
    shadow: "shadow-sky-500/50",
  },
  [MarketStatus.AFTERMARKET]: {
    text: "Aftermarket Trading",
    color: "bg-amber-500",
    shadow: "shadow-amber-500/50",
  },
  [MarketStatus.CLOSED]: {
    text: "Market is Closed",
    color: "bg-rose-500",
    shadow: "shadow-rose-500/50",
  },
};

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, holiday }) => {
  const config = statusConfig[status];

  return (
    <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
            <span className={`relative flex h-4 w-4`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-4 w-4 ${config.color} border-2 border-slate-800`}></span>
            </span>
            <h2 className={`text-3xl font-bold text-white ${config.shadow} transition-all`}>{config.text}</h2>
        </div>
        {status === MarketStatus.CLOSED && holiday && (
            <p className="text-rose-300 text-sm">Reason: {holiday}</p>
        )}
         {status === MarketStatus.CLOSED && !holiday && new Date().getDay() !== 0 && new Date().getDay() !== 6 && (
            <p className="text-slate-400 text-sm">Outside regular trading hours</p>
        )}
    </div>
  );
};
