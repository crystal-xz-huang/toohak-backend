// Module to manage timers for quiz sessions

const activeTimers = new Map();

export enum TimerState {
  questionCountDown = 'QUESTION_COUNTDOWN',
  questionDuration = 'QUESTION_DURATION',
}

/**
 * Set a timer for a quiz session
 * @param quizSessionId
 * @param timerType - the type of timer
 * @param duration  - the duration of the timer in seconds
 * @param callback
 */
export function setTimer(quizSessionId: number, timerType: TimerState, duration: number, callback: () => void) {
  const key = `${quizSessionId}-${timerType}`;
  const timer = setTimeout(callback, duration * 1000);
  activeTimers.set(key, timer);
}

/**
 * Clear a timer for a quiz session
 * @param quizSessionId - the id of the quiz session
 */
export function clearTimer(quizSessionId: number, timerType: TimerState) {
  const key = `${quizSessionId}-${timerType}`;
  const timer = activeTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    activeTimers.delete(key);
  }
}

/**
 * Clear all timers
 */
export function clearAllTimers() {
  for (const timer of activeTimers.values()) {
    clearTimeout(timer);
  }
  activeTimers.clear();
}
