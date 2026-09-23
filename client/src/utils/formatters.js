/**
 * Format total seconds into MM:SS or HH:MM:SS
 */
export const formatTime = (totalSeconds) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (num) => String(num).padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Format seconds into a friendly human string (e.g. "2h 15m" or "45m")
 */
export const formatDurationHuman = (totalSeconds) => {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
};

/**
 * Format minutes into "Xh Ym"
 */
export const formatMinutesHuman = (minutes) => {
  if (!minutes || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

/**
 * Format Date to standard human readable string (e.g. "Sep 23, 2026")
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return '—';
  const d = new Date(dateValue);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format Date to 12-hour time (e.g. "2:45 PM")
 */
export const formatTimeOfDay = (dateValue) => {
  if (!dateValue) return '—';
  const d = new Date(dateValue);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get dynamic time-based greeting for user
 */
export const getGreeting = (name = 'Student') => {
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (hour >= 12 && hour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (hour >= 17) {
    timeGreeting = 'Good evening';
  }
  return `${timeGreeting}, ${name}`;
};

/**
 * Motivational quotes pool
 */
export const MOTIVATIONAL_QUOTES = [
  'Small progress every day adds up to big results.',
  'Focus is a muscle. The more you practice, the stronger it gets.',
  'Deep work is the superpower of the 21st century.',
  'Action is the foundational key to all success.',
  'Consistency beats intensity every single time.',
  'Your future self will thank you for the focus you invest today.',
  'One focused hour is worth five distracted ones.',
  'Discipline is choosing between what you want now and what you want most.'
];

export const getRandomMotivationalQuote = () => {
  const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
};
