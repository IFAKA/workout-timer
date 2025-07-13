// Pure timer domain logic for workout-timer

/**
 * Formats seconds as mm:ss string.
 */
export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Validates if a set input is a valid number of sets (1-99).
 */
export function isValidSetInput(input: string): boolean {
  const n = parseInt(input, 10);
  return !isNaN(n) && n > 0 && n < 100;
}

/**
 * Validates if a timer input is a valid, unique, positive integer.
 */
export function isValidTimerInput(input: string, timers: number[], editIndex?: number): boolean {
  const val = parseInt(input, 10);
  if (editIndex !== undefined) {
    return !isNaN(val) && val > 0 && (!timers.includes(val) || val === timers[editIndex]);
  }
  return !isNaN(val) && val > 0 && !timers.includes(val);
}

/**
 * Returns the next set number and whether the timer should reset or finish.
 */
export function getNextSet(currentSet: number, sets: number): { nextSet: number, finished: boolean } {
  if (currentSet < sets) {
    return { nextSet: currentSet + 1, finished: false };
  }
  return { nextSet: 1, finished: true };
} 