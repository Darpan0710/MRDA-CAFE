/**
 * Asia/Kolkata (IST, UTC+5:30) date & time utilities for MRDĀ Café
 */

// Formats the current date in Asia/Kolkata as YYYY-MM-DD
export function getTodayDateStringIST(now = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
}

// Parses a 12-hour time string into hours (0-23) and minutes (0-59)
export function parse12HourTime(timeStr: string): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return { hours, minutes };
}

// Standard valid reservation slots (restricted to 10:00 AM through 8:00 PM)
export const ALLOWED_TIME_SLOTS = [
  '10:00 AM',
  '12:00 PM',
  '2:00 PM',
  '4:30 PM',
  '6:30 PM',
  '8:00 PM',
];

// Checks if a time slot is within the allowed operating window: 10:00 AM to 8:00 PM (10:00 to 20:00)
export function isSlotWithinAllowedHours(timeStr: string): boolean {
  const parsed = parse12HourTime(timeStr);
  if (!parsed) return false;
  const totalMinutes = parsed.hours * 60 + parsed.minutes;
  const minMinutes = 10 * 60; // 10:00 AM = 600
  const maxMinutes = 20 * 60; // 8:00 PM = 1200
  return totalMinutes >= minMinutes && totalMinutes <= maxMinutes;
}

// Returns a Date representing dateStr (YYYY-MM-DD) and timeStr in Asia/Kolkata
export function getSlotDateInIST(dateStr: string, timeStr: string): Date {
  const parsed = parse12HourTime(timeStr);
  if (!parsed) return new Date(NaN);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const isoString = `${dateStr}T${pad(parsed.hours)}:${pad(parsed.minutes)}:00+05:30`;
  return new Date(isoString);
}

// Checks if a given slot on a given date has already elapsed in IST
export function isSlotElapsedIST(dateStr: string, timeStr: string, now = new Date()): boolean {
  const todayIST = getTodayDateStringIST(now);
  if (dateStr < todayIST) return true; // past date
  if (dateStr > todayIST) return false; // future date
  // For today, check slot time against current moment
  const slotDate = getSlotDateInIST(dateStr, timeStr);
  if (isNaN(slotDate.getTime())) return false;
  return slotDate.getTime() <= now.getTime();
}

// Checks if a date string is entirely in the past in IST
export function isDateInPastIST(dateStr: string, now = new Date()): boolean {
  const todayIST = getTodayDateStringIST(now);
  return dateStr < todayIST;
}

// Month dictionary for parsing dates
const MONTHS_MAP: Record<string, string> = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
  JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
};

// Parses the final session end time of an event in IST milliseconds
// Supports single ISO dates (e.g. "2026-10-31"), multi-day ISO ranges ("2026-10-31 to 2026-11-01"),
// and textual date ranges ("31 Oct – 01 Nov 2026", "October 31 - November 1, 2026").
export function parseEventEndTimestampIST(dateStr: string, timeStr: string): number | null {
  if (!dateStr) return null;

  // 1. Check for all YYYY-MM-DD matches; the last one is the final date of the event
  const isoMatches = Array.from(dateStr.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g));
  let isoDate: string | null = null;

  if (isoMatches.length > 0) {
    isoDate = isoMatches[isoMatches.length - 1][0];
  } else {
    // 2. Check for textual dates (including ranges like "31 Oct – 01 Nov 2026")
    const yearMatch = dateStr.match(/\b(20\d{2})\b/);
    const defaultYear = yearMatch ? yearMatch[1] : null;

    // Split on range delimiters to examine the final segment of the range
    const parts = dateStr.split(/[-–—]|(?:\bto\b)|(?:\bthrough\b)/i);
    const lastPart = parts[parts.length - 1].trim();

    const textMatch =
      lastPart.match(/(\d{1,2})\s+([A-Za-z]{3,9})(?:\s+(\d{4}))?/i) ||
      lastPart.match(/([A-Za-z]{3,9})\s+(\d{1,2})(?:,?\s+(\d{4}))?/i);

    if (textMatch) {
      let day: string;
      let monthStr: string;
      let year: string | null;

      if (isNaN(parseInt(textMatch[1], 10))) {
        monthStr = textMatch[1];
        day = textMatch[2].padStart(2, '0');
        year = textMatch[3] || defaultYear;
      } else {
        day = textMatch[1].padStart(2, '0');
        monthStr = textMatch[2];
        year = textMatch[3] || defaultYear;
      }

      const mKey = monthStr.toUpperCase().substring(0, 3);
      if (MONTHS_MAP[mKey] && year) {
        isoDate = `${year}-${MONTHS_MAP[mKey]}-${day}`;
      }
    }
  }

  if (!isoDate) return null; // Recurring or unspecific date

  // Extract end time part (e.g. "4:00 PM – 9:30 PM", "6:30 PM - 9:30 PM", "10:00 AM – 11:30 AM")
  let endTimePart = timeStr || '';
  if (/[-–—]|to/i.test(endTimePart)) {
    const parts = endTimePart.split(/[-–—]|to/i);
    endTimePart = parts[parts.length - 1].trim();
  }

  const timeMatch = endTimePart.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  let hours = 23;
  let minutes = 59;
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const period = timeMatch[3].toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  }

  const pad = (n: number) => n.toString().padStart(2, '0');
  const isoWithTime = `${isoDate}T${pad(hours)}:${pad(minutes)}:00+05:30`;
  const timeMs = new Date(isoWithTime).getTime();
  return isNaN(timeMs) ? null : timeMs;
}

// Returns true if event has fully ended in IST
export function isEventPastIST(dateStr: string, timeStr: string, now = new Date()): boolean {
  const endMs = parseEventEndTimestampIST(dateStr, timeStr);
  if (endMs === null) return false; // Recurring/unspecific events are evaluated via evaluateEventStatus
  return now.getTime() > endMs;
}

// Parses the starting timestamp of an event in IST milliseconds
// For multi-day events, returns the start timestamp of the earliest session that has not yet ended
export function parseEventStartTimestampIST(dateStr: string, timeStr: string, now = new Date()): number | null {
  if (!dateStr) return null;

  // Extract start time part (e.g. "4:00 PM – 9:30 PM" -> "4:00 PM")
  let startTimePart = timeStr || '';
  if (/[-–—]|to/i.test(startTimePart)) {
    const parts = startTimePart.split(/[-–—]|to/i);
    startTimePart = parts[0].trim();
  }

  const timeMatch = startTimePart.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  let hours = 10;
  let minutes = 0;
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const period = timeMatch[3].toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  }
  const pad = (n: number) => n.toString().padStart(2, '0');

  // Check for ISO dates
  const isoMatches = Array.from(dateStr.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g));
  if (isoMatches.length > 0) {
    for (const match of isoMatches) {
      const dStr = match[0];
      const sessionEnd = parseEventEndTimestampIST(dStr, timeStr);
      if (sessionEnd && now.getTime() <= sessionEnd) {
        const isoWithTime = `${dStr}T${pad(hours)}:${pad(minutes)}:00+05:30`;
        const timeMs = new Date(isoWithTime).getTime();
        return isNaN(timeMs) ? null : timeMs;
      }
    }
    const firstIso = isoMatches[0][0];
    const isoWithTime = `${firstIso}T${pad(hours)}:${pad(minutes)}:00+05:30`;
    return new Date(isoWithTime).getTime();
  }

  // Check for textual date format (e.g. "31 Oct – 01 Nov 2026", "20 November 2026")
  const yearMatch = dateStr.match(/\b(20\d{2})\b/);
  const defaultYear = yearMatch ? yearMatch[1] : null;
  const parts = dateStr.split(/[-–—]|(?:\bto\b)|(?:\bthrough\b)/i);

  for (const part of parts) {
    const textMatch =
      part.match(/(\d{1,2})\s+([A-Za-z]{3,9})(?:\s+(\d{4}))?/i) ||
      part.match(/([A-Za-z]{3,9})\s+(\d{1,2})(?:,?\s+(\d{4}))?/i);

    if (textMatch) {
      let day: string;
      let monthStr: string;
      let year: string | null;

      if (isNaN(parseInt(textMatch[1], 10))) {
        monthStr = textMatch[1];
        day = textMatch[2].padStart(2, '0');
        year = textMatch[3] || defaultYear;
      } else {
        day = textMatch[1].padStart(2, '0');
        monthStr = textMatch[2];
        year = textMatch[3] || defaultYear;
      }

      const mKey = monthStr.toUpperCase().substring(0, 3);
      if (MONTHS_MAP[mKey] && year) {
        const isoDate = `${year}-${MONTHS_MAP[mKey]}-${day}`;
        const sessionEnd = parseEventEndTimestampIST(isoDate, timeStr);
        if (sessionEnd && now.getTime() <= sessionEnd) {
          const isoWithTime = `${isoDate}T${pad(hours)}:${pad(minutes)}:00+05:30`;
          return new Date(isoWithTime).getTime();
        }
      }
    }
  }

  return null;
}

// Determines whether an event date string indicates a recurring series
export function isRecurringEvent(dateStr: string): boolean {
  if (!dateStr) return false;
  const recurringKeywords = /alternate|every|monthly|weekly|first|second|third|fourth|last|saturdays?|sundays?|thursdays?|fridays?|mondays?|tuesdays?|wednesdays?/i;
  return recurringKeywords.test(dateStr);
}

// Determines the next upcoming occurrence for recurring event patterns in Asia/Kolkata
// Returns null if the recurring schedule is vague, missing, or unrecognized
export function getNextRecurringOccurrenceIST(
  dateStr: string,
  timeStr: string,
  now = new Date()
): { dateFormatted: string; isoDate: string; startTimestamp: number; label: string } | null {
  if (!dateStr) return null;
  const lower = dateStr.toLowerCase().trim();
  const todayIST = getTodayDateStringIST(now); // YYYY-MM-DD
  const [currYear, currMonth, currDay] = todayIST.split('-').map(Number);

  // Parse start time & end time of event
  let startTimePart = timeStr || '';
  let endTimePart = timeStr || '';
  if (/[-–—]|to/i.test(timeStr)) {
    const p = timeStr.split(/[-–—]|to/i);
    startTimePart = p[0].trim();
    endTimePart = p[p.length - 1].trim();
  }

  const parseHM = (str: string, defH: number, defM: number) => {
    const match = str.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
    if (!match) return { h: defH, m: defM };
    let h = parseInt(match[1], 10);
    const m = match[2] ? parseInt(match[2], 10) : 0;
    if (match[3].toUpperCase() === 'PM' && h < 12) h += 12;
    if (match[3].toUpperCase() === 'AM' && h === 12) h = 0;
    return { h, m };
  };

  const { h: startHour, m: startMin } = parseHM(startTimePart, 10, 0);
  const { h: endHour, m: endMin } = parseHM(endTimePart, 22, 0);

  function isCandidatePassed(candidateY: number, candidateM: number, candidateD: number): boolean {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const isoString = `${candidateY}-${pad(candidateM)}-${pad(candidateD)}T${pad(endHour)}:${pad(endMin)}:00+05:30`;
    return now.getTime() > new Date(isoString).getTime();
  }

  // Identify weekday
  const WEEKDAYS: Record<string, number> = {
    sunday: 0,
    sundays: 0,
    monday: 1,
    mondays: 1,
    tuesday: 2,
    tuesdays: 2,
    wednesday: 3,
    wednesdays: 3,
    thursday: 4,
    thursdays: 4,
    friday: 5,
    fridays: 5,
    saturday: 6,
    saturdays: 6,
  };

  let targetDayOfWeek: number | null = null;
  for (const [dayName, dayNum] of Object.entries(WEEKDAYS)) {
    if (lower.includes(dayName)) {
      targetDayOfWeek = dayNum;
      break;
    }
  }

  // If no specific weekday is found (e.g. "Weekly", "Monthly", "Alternate", "TBD"),
  // this is an invalid / unconfigured recurring schedule: return null!
  if (targetDayOfWeek === null) {
    return null;
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Check for nth-weekday-of-month (e.g. "Third Thursday of the Month", "First Sunday")
  const ordinalMatch = lower.match(/\b(first|second|third|fourth|last)\b/i);
  if (ordinalMatch) {
    const ordinal = ordinalMatch[1].toLowerCase();
    const targetOrdinal =
      ordinal === 'first' ? 1 : ordinal === 'second' ? 2 : ordinal === 'third' ? 3 : ordinal === 'fourth' ? 4 : 5;

    const getNthWeekday = (year: number, month: number, targetDay: number, n: number): number => {
      let count = 0;
      let lastMatch = 1;
      for (let day = 1; day <= 31; day++) {
        const testD = new Date(`${year}-${pad(month)}-${pad(day)}T12:00:00+05:30`);
        if (testD.getMonth() + 1 !== month) break;
        if (testD.getDay() === targetDay) {
          count++;
          lastMatch = day;
          if (count === n) return day;
        }
      }
      return lastMatch;
    };

    let targetYear = currYear;
    let targetMonth = currMonth;
    let dayOfMonth = getNthWeekday(targetYear, targetMonth, targetDayOfWeek, targetOrdinal);

    if (isCandidatePassed(targetYear, targetMonth, dayOfMonth)) {
      targetMonth += 1;
      if (targetMonth > 12) {
        targetMonth = 1;
        targetYear += 1;
      }
      dayOfMonth = getNthWeekday(targetYear, targetMonth, targetDayOfWeek, targetOrdinal);
    }

    const isoDate = `${targetYear}-${pad(targetMonth)}-${pad(dayOfMonth)}`;
    const startIso = `${isoDate}T${pad(startHour)}:${pad(startMin)}:00+05:30`;
    const targetDate = new Date(`${isoDate}T12:00:00+05:30`);

    return {
      dateFormatted: targetDate.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      isoDate,
      startTimestamp: new Date(startIso).getTime(),
      label: 'Next Gathering',
    };
  }

  // Standard recurring weekday (e.g. "Alternate Saturdays", "Monthly, Sunday", "Every Friday", "Sundays")
  const d = new Date(`${todayIST}T12:00:00+05:30`);
  const currentDayOfWeek = d.getDay();
  let daysUntil = (targetDayOfWeek - currentDayOfWeek + 7) % 7;

  if (daysUntil === 0 && isCandidatePassed(currYear, currMonth, currDay)) {
    daysUntil = 7;
  }

  const targetDate = new Date(d.getTime() + daysUntil * 24 * 60 * 60 * 1000);
  const isoDate = getTodayDateStringIST(targetDate);
  const startIso = `${isoDate}T${pad(startHour)}:${pad(startMin)}:00+05:30`;

  return {
    dateFormatted: targetDate.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    isoDate,
    startTimestamp: new Date(startIso).getTime(),
    label: 'Next Session',
  };
}

// Evaluates comprehensive event status: upcoming vs past
export function evaluateEventStatus(
  event: { date: string; time: string },
  now = new Date()
): {
  isUpcoming: boolean;
  isPast: boolean;
  isRecurring: boolean;
  displayDate: string;
  startTimestamp?: number;
  nextOccurrence?: { dateFormatted: string; isoDate: string; startTimestamp: number; label: string };
} {
  const endMs = parseEventEndTimestampIST(event.date, event.time);
  if (endMs !== null) {
    const isPast = now.getTime() > endMs;
    const startTimestamp = parseEventStartTimestampIST(event.date, event.time, now) || undefined;
    return {
      isUpcoming: !isPast,
      isPast,
      isRecurring: false,
      displayDate: event.date,
      startTimestamp,
    };
  }

  if (isRecurringEvent(event.date)) {
    const nextOcc = getNextRecurringOccurrenceIST(event.date, event.time, now);
    if (!nextOcc) {
      // Vague, missing, or invalid recurring schedule - exclude from upcoming
      return {
        isUpcoming: false,
        isPast: true,
        isRecurring: false,
        displayDate: event.date,
      };
    }
    return {
      isUpcoming: true,
      isPast: false,
      isRecurring: true,
      displayDate: event.date,
      startTimestamp: nextOcc.startTimestamp,
      nextOccurrence: nextOcc,
    };
  }

  return {
    isUpcoming: false,
    isPast: true,
    isRecurring: false,
    displayDate: event.date,
  };
}

