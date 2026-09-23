/**
 * Formats a Date object to YYYY-MM-DD
 */
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculates current streak and longest streak from an array of study sessions.
 * @param {Array} sessions - Array of StudySession documents with startedAt dates
 * @returns {{ currentStreak: number, longestStreak: number, totalStudyDays: number }}
 */
export const calculateStreak = (sessions) => {
  if (!sessions || sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalStudyDays: 0 };
  }

  // Get unique study days sorted chronologically ascending
  const uniqueDateStrings = [
    ...new Set(
      sessions
        .map((s) => formatDate(s.startedAt || s.createdAt))
        .filter(Boolean)
    )
  ].sort();

  const totalStudyDays = uniqueDateStrings.length;
  if (totalStudyDays === 0) {
    return { currentStreak: 0, longestStreak: 0, totalStudyDays: 0 };
  }

  // Calculate longest streak across all history
  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < uniqueDateStrings.length; i++) {
    const prev = new Date(uniqueDateStrings[i - 1]);
    const curr = new Date(uniqueDateStrings[i]);
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentRun++;
      if (currentRun > longestStreak) {
        longestStreak = currentRun;
      }
    } else if (diffDays > 1) {
      currentRun = 1;
    }
  }

  // Calculate current active streak ending today or yesterday
  const todayStr = formatDate(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  const datesSet = new Set(uniqueDateStrings);

  let currentStreak = 0;
  let checkDate = new Date();

  // If user studied today, streak starts counting from today
  if (datesSet.has(todayStr)) {
    currentStreak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else if (datesSet.has(yesterdayStr)) {
    // If user hasn't studied today yet, but studied yesterday, the streak is still alive
    currentStreak = 1;
    checkDate = new Date(yesterday);
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Neither today nor yesterday had study sessions: streak is 0
    return {
      currentStreak: 0,
      longestStreak: Math.max(longestStreak, 0),
      totalStudyDays
    };
  }

  // Count backwards from checkDate
  while (true) {
    const dateStr = formatDate(checkDate);
    if (datesSet.has(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalStudyDays
  };
};
