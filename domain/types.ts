// Shared types for timer and sets domain logic

export type Timer = number; // seconds

export interface TimerState {
  sets: number;
  currentSet: number;
  timers: Timer[];
  selectedTimer: Timer;
  secondsLeft: number;
  running: boolean;
} 