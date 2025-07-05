
import { MarketStatus, MarketEvent } from '../types';

const NYSE_TIMEZONE = 'America/New_York';
const holidayCache: Map<string, string> = new Map();

// Holiday names as they appear in the Nager.Date API
const NYSE_OBSERVED_HOLIDAY_NAMES = new Set([
  "New Year's Day",
  "Martin Luther King, Jr.'s Birthday",
  "Washington's Birthday",
  "Good Friday",
  "Memorial Day",
  "Juneteenth",
  "Independence Day",
  "Labor Day",
  "Thanksgiving Day",
  "Christmas Day",
]);

/**
 * Fetches NYSE holidays for the current and next year from a public API
 * and populates an in-memory cache. Should be called once on app startup.
 */
export async function initializeHolidays(): Promise<void> {
  if (holidayCache.size > 0) return; // Avoid re-fetching

  const currentYear = new Date().getFullYear();
  const yearsToFetch = [currentYear, currentYear + 1];
  
  console.log(`Fetching holidays for ${yearsToFetch.join(' and ')}...`);

  try {
    const responses = await Promise.all(
      yearsToFetch.map(year => fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/US`))
    );

    for (const response of responses) {
      if (!response.ok) {
        throw new Error(`Failed to fetch holiday data: ${response.statusText}`);
      }
      const holidays: { date: string, name: string }[] = await response.json();
      for (const holiday of holidays) {
        if (NYSE_OBSERVED_HOLIDAY_NAMES.has(holiday.name)) {
          holidayCache.set(holiday.date, holiday.name);
        }
      }
    }
    console.log(`Initialized ${holidayCache.size} NYSE holidays.`);
  } catch (error) {
    console.error("Could not initialize holidays from API.", error);
    throw error; // Re-throw to allow UI to handle it
  }
}

const getNyseDateParts = (date: Date) => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: NYSE_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
    }).formatToParts(date).reduce((acc, part) => {
        if (part.type !== 'literal') {
            acc[part.type as string] = part.value;
        }
        return acc;
    }, {} as Record<string, string>);

    return {
        year: parts.year,
        month: parts.month,
        day: parts.day,
        weekday: parts.weekday,
    };
}


const isTradingDay = (date: Date): { trading: boolean; holidayName: string | null } => {
  const { year, month, day, weekday } = getNyseDateParts(date);
  
  if (weekday === 'Sat' || weekday === 'Sun') {
    return { trading: false, holidayName: 'Weekend' };
  }
  
  const dateString = `${year}-${month}-${day}`;
  if (holidayCache.has(dateString)) {
    return { trading: false, holidayName: holidayCache.get(dateString)! };
  }

  return { trading: true, holidayName: null };
};

const getEventsForDate = (date: Date): MarketEvent[] => {
    const { year, month, day } = getNyseDateParts(date);
    const createEventDate = (hour: number, minute: number): Date => {
       const referenceDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12, 0, 0));
       const nyHourAtUtcNoon = Number(new Intl.DateTimeFormat('en-US', {
           timeZone: NYSE_TIMEZONE,
           hour12: false,
           hour: 'numeric',
       }).format(referenceDate));
       
       const offsetHours = 12 - nyHourAtUtcNoon;
       const eventUtcHour = hour + offsetHours;

       return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), eventUtcHour, minute));
    };

    return [
        { name: 'Premarket Opens', dateTime: createEventDate(7, 0), statusOnEvent: MarketStatus.PREMARKET },
        { name: 'Market Opens', dateTime: createEventDate(9, 30), statusOnEvent: MarketStatus.OPEN },
        { name: 'Market Closes', dateTime: createEventDate(16, 0), statusOnEvent: MarketStatus.AFTERMARKET },
        { name: 'Aftermarket Closes', dateTime: createEventDate(20, 0), statusOnEvent: MarketStatus.CLOSED },
    ];
};

export const getCurrentStatus = (now: Date): { status: MarketStatus; holiday: string | null } => {
  const { trading, holidayName } = isTradingDay(now);

  if (!trading) {
    return { status: MarketStatus.CLOSED, holiday: holidayName };
  }
  
  const events = getEventsForDate(now);
  
  if (now >= events[3].dateTime || now < events[0].dateTime) {
    return { status: MarketStatus.CLOSED, holiday: null };
  }
  if (now >= events[2].dateTime) {
    return { status: MarketStatus.AFTERMARKET, holiday: null };
  }
  if (now >= events[1].dateTime) {
    return { status: MarketStatus.OPEN, holiday: null };
  }
  if (now >= events[0].dateTime) {
    return { status: MarketStatus.PREMARKET, holiday: null };
  }
  
  return { status: MarketStatus.CLOSED, holiday: null };
};

export const getUpcomingEvents = (now: Date): MarketEvent[] => {
  let upcomingEvents: MarketEvent[] = [];
  let dateToCheck = new Date(now.getTime());
  dateToCheck.setHours(0,0,0,0); // Start check from today

  for (let i = 0; i < 14; i++) { // Check up to two weeks ahead for safety
    if (isTradingDay(dateToCheck).trading) {
      const dailyEvents = getEventsForDate(dateToCheck);
      dailyEvents.forEach(event => {
        if (event.dateTime > now) {
          upcomingEvents.push(event);
        }
      });
    }
    if (upcomingEvents.length >= 2) {
      break;
    }
    dateToCheck.setDate(dateToCheck.getDate() + 1);
  }

  return upcomingEvents.slice(0, 2);
};

