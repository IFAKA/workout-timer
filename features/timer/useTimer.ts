import { useCallback, useEffect, useRef, useState } from 'react';
import { formatTime, getNextSet } from '../../domain/timer';
import { Timer } from '../../domain/types';
import { playBeep, useBeepPlayer } from '../../services/audio';
import { getItem, setItem } from '../../services/storage';
import { vibrate } from '../../services/vibration';

const DEFAULT_SETS = 3;
const DEFAULT_TIMERS = [60, 120, 180];

export function useTimer() {
  const [sets, setSets] = useState(DEFAULT_SETS);
  const [currentSet, setCurrentSet] = useState(1);
  const [timers, setTimers] = useState<Timer[]>(DEFAULT_TIMERS);
  const [selectedTimer, setSelectedTimer] = useState(timers[2]);
  const [secondsLeft, setSecondsLeft] = useState(selectedTimer);
  const [running, setRunning] = useState(false);

  // Selection and modal state
  const [timerSelectionMode, setTimerSelectionMode] = useState(false);
  const [selectedTimers, setSelectedTimers] = useState<number[]>([]);
  const [showAddTimerModal, setShowAddTimerModal] = useState(false);
  const [showEditTimerModal, setShowEditTimerModal] = useState(false);
  const [timerEditIndex, setTimerEditIndex] = useState<number | null>(null);
  const [timerInput, setTimerInput] = useState('');

  const beepPlayer = useBeepPlayer();
  const intervalRef = useRef<any>(null);

  // Load persisted state on mount
  useEffect(() => {
    (async () => {
      const [setsVal, timersVal, selectedTimerVal, currentSetVal, secondsLeftVal, runningVal] = await Promise.all([
        getItem<number>('sets'),
        getItem<Timer[]>('timers'),
        getItem<number>('selectedTimer'),
        getItem<number>('currentSet'),
        getItem<number>('secondsLeft'),
        getItem<string>('running'),
      ]);
      if (setsVal) setSets(setsVal);
      if (timersVal) setTimers(timersVal);
      if (selectedTimerVal) setSelectedTimer(selectedTimerVal);
      if (currentSetVal) setCurrentSet(currentSetVal);
      if (secondsLeftVal) setSecondsLeft(secondsLeftVal);
      if (runningVal) setRunning(runningVal === 'true');
    })();
  }, []);

  // Persist state on change
  useEffect(() => { setItem('sets', sets); }, [sets]);
  useEffect(() => { setItem('timers', timers); }, [timers]);
  useEffect(() => { setItem('selectedTimer', selectedTimer); }, [selectedTimer]);
  useEffect(() => { setItem('currentSet', currentSet); }, [currentSet]);
  useEffect(() => { setItem('secondsLeft', secondsLeft); }, [secondsLeft]);
  useEffect(() => { setItem('running', running); }, [running]);

  // Timer logic
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            // Timer finished
            playBeep(beepPlayer);
            vibrate(400);
            const { nextSet, finished } = getNextSet(currentSet, sets);
            if (!finished) {
              setCurrentSet(nextSet);
              setRunning(false);
              return selectedTimer;
            } else {
              setRunning(false);
              setCurrentSet(1);
              return selectedTimer;
            }
          }
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, currentSet, sets, selectedTimer, beepPlayer]);

  // Update secondsLeft when selectedTimer changes (if not running)
  useEffect(() => {
    if (!running) {
      setSecondsLeft(selectedTimer);
    }
  }, [selectedTimer, running]);

  // Exit selection mode if all timers are unselected
  useEffect(() => {
    if (timerSelectionMode && selectedTimers.length === 0) {
      exitTimerSelectionMode();
    }
  }, [selectedTimers, timerSelectionMode]);

  // Handlers
  const handleStartPause = useCallback(() => setRunning(r => !r), []);
  const handleReset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(selectedTimer);
    setCurrentSet(1);
  }, [selectedTimer]);
  const handleSelectTimer = useCallback((t: number) => {
    setSelectedTimer(t);
    setSecondsLeft(t);
  }, []);

  // Selection mode logic
  const handleTimerLongPress = (idx: number) => {
    setTimerSelectionMode(true);
    setSelectedTimers([timers[idx]]);
  };
  const handleTimerSelect = (idx: number) => {
    const t = timers[idx];
    setSelectedTimers((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };
  const exitTimerSelectionMode = () => {
    setTimerSelectionMode(false);
    setSelectedTimers([]);
  };

  // Add timer modal
  const handleAddTimer = () => {
    setTimerInput('');
    setShowAddTimerModal(true);
  };
  const handleAddTimerSave = () => {
    const val = parseInt(timerInput, 10);
    if (!isNaN(val) && val > 0 && !timers.includes(val)) {
      const newTimers = [...timers, val].sort((a, b) => a - b);
      setTimers(newTimers);
      setSelectedTimer(val);
      setSecondsLeft(val);
      setShowAddTimerModal(false);
      setTimerInput('');
    }
  };

  // Edit timer modal
  const handleEditTimer = () => {
    if (selectedTimers.length === 1) {
      const idx = timers.findIndex((t) => t === selectedTimers[0]);
      setTimerEditIndex(idx);
      setTimerInput(String(timers[idx]));
      setShowEditTimerModal(true);
    }
  };
  const handleEditTimerSave = () => {
    const val = parseInt(timerInput, 10);
    if (
      !isNaN(val) &&
      val > 0 &&
      (timerEditIndex !== null && (!timers.includes(val) || val === timers[timerEditIndex]))
    ) {
      const newTimers = timers.slice();
      newTimers[timerEditIndex!] = val;
      setTimers(newTimers.sort((a, b) => a - b));
      setSelectedTimer(val);
      setSecondsLeft(val);
      setShowEditTimerModal(false);
      setTimerEditIndex(null);
      setTimerSelectionMode(false);
      setSelectedTimers([]);
      setTimerInput('');
    }
  };

  // Remove timers
  const handleRemoveTimers = () => {
    if (timers.length - selectedTimers.length < 1) return;
    const newTimers = timers.filter((t) => !selectedTimers.includes(t));
    setTimers(newTimers);
    // If selected timer was removed, select next available
    if (selectedTimers.includes(selectedTimer)) {
      setSelectedTimer(newTimers[0]);
      setSecondsLeft(newTimers[0]);
    }
    setTimerSelectionMode(false);
    setSelectedTimers([]);
  };

  // Timer input validation
  const isValidTimerInput = () => {
    const val = parseInt(timerInput, 10);
    if (showAddTimerModal) {
      return !isNaN(val) && val > 0 && !timers.includes(val);
    } else if (showEditTimerModal && timerEditIndex !== null) {
      return !isNaN(val) && val > 0 && (!timers.includes(val) || val === timers[timerEditIndex]);
    }
    return false;
  };

  return {
    sets,
    setSets,
    currentSet,
    setCurrentSet,
    timers,
    setTimers,
    selectedTimer,
    setSelectedTimer,
    secondsLeft,
    setSecondsLeft,
    running,
    setRunning,
    handleStartPause,
    handleReset,
    handleSelectTimer,
    formatTime,
    // Selection and modal state/handlers
    timerSelectionMode,
    selectedTimers,
    handleTimerLongPress,
    handleTimerSelect,
    exitTimerSelectionMode,
    showAddTimerModal,
    setShowAddTimerModal,
    showEditTimerModal,
    setShowEditTimerModal,
    timerEditIndex,
    setTimerEditIndex,
    timerInput,
    setTimerInput,
    handleAddTimer,
    handleAddTimerSave,
    handleEditTimer,
    handleEditTimerSave,
    handleRemoveTimers,
    isValidTimerInput,
  };
} 