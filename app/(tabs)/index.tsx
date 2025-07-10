import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { FlatList, Keyboard, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Vibration, View } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';

const DEFAULT_SETS = 3;
const DEFAULT_TIMERS = [60, 120, 180]; // seconds

export default function TimerScreen() {
  const [sets, setSets] = useState(DEFAULT_SETS);
  const [currentSet, setCurrentSet] = useState(1);
  const [timers, setTimers] = useState(DEFAULT_TIMERS);
  const [selectedTimer, setSelectedTimer] = useState(timers[2]);
  const [secondsLeft, setSecondsLeft] = useState(selectedTimer);
  const [running, setRunning] = useState(false);
  const [showSetModal, setShowSetModal] = useState(false);
  const [editSets, setEditSets] = useState(String(sets));
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerEditIndex, setTimerEditIndex] = useState<number | null>(null);
  const [timerInput, setTimerInput] = useState('');
  const [showAddTimerModal, setShowAddTimerModal] = useState(false);
  const [showEditTimerModal, setShowEditTimerModal] = useState(false);
  const [timerSelectionMode, setTimerSelectionMode] = useState(false);
  const [selectedTimers, setSelectedTimers] = useState<number[]>([]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Load persisted state on mount
  useEffect(() => {
    (async () => {
      try {
        const [setsStr, timersStr, selectedTimerStr, currentSetStr, secondsLeftStr, runningStr] = await Promise.all([
          AsyncStorage.getItem('sets'),
          AsyncStorage.getItem('timers'),
          AsyncStorage.getItem('selectedTimer'),
          AsyncStorage.getItem('currentSet'),
          AsyncStorage.getItem('secondsLeft'),
          AsyncStorage.getItem('running'),
        ]);
        if (setsStr) setSets(Number(setsStr));
        if (timersStr) setTimers(JSON.parse(timersStr));
        if (selectedTimerStr) setSelectedTimer(Number(selectedTimerStr));
        if (currentSetStr) setCurrentSet(Number(currentSetStr));
        if (secondsLeftStr) setSecondsLeft(Number(secondsLeftStr));
        if (runningStr) setRunning(runningStr === 'true');
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Persist state on change
  useEffect(() => {
    AsyncStorage.setItem('sets', String(sets));
  }, [sets]);
  useEffect(() => {
    AsyncStorage.setItem('timers', JSON.stringify(timers));
  }, [timers]);
  useEffect(() => {
    AsyncStorage.setItem('selectedTimer', String(selectedTimer));
  }, [selectedTimer]);
  useEffect(() => {
    AsyncStorage.setItem('currentSet', String(currentSet));
  }, [currentSet]);
  useEffect(() => {
    AsyncStorage.setItem('secondsLeft', String(secondsLeft));
  }, [secondsLeft]);
  useEffect(() => {
    AsyncStorage.setItem('running', String(running));
  }, [running]);

  // Play sound and vibrate when timer ends
  const playNotification = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/beep.mp3'), // Place a beep.mp3 in assets/sounds
        { shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded || (status.isLoaded && status.didJustFinish)) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      // fallback to vibration only
    }
    Vibration.vibrate(400);
  };

  // Timer logic
  useEffect(() => {
    let interval: number | null = null;
    if (running) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            // Timer finished
            playNotification();
            if (currentSet < sets) {
              setCurrentSet((s) => s + 1);
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
      if (interval) clearInterval(interval);
    };
  }, [running, currentSet, sets, selectedTimer]);

  // Update secondsLeft when selectedTimer changes (if not running)
  useEffect(() => {
    if (!running) {
      setSecondsLeft(selectedTimer);
    }
  }, [selectedTimer, running]);

  // Handlers
  const handleStartPause = () => setRunning(r => !r);
  const handleReset = () => {
    setRunning(false);
    setSecondsLeft(selectedTimer);
    setCurrentSet(1);
  };
  const handleSelectTimer = (t: number) => {
    setSelectedTimer(t);
    setSecondsLeft(t);
  };

  // Input validation for sets
  const isValidSetInput = () => {
    const n = parseInt(editSets, 10);
    return !isNaN(n) && n > 0 && n < 100;
  };

  // Open timer modal on long-press
  const handleTimerModalOpen = () => {
    setTimerInput('');
    setTimerEditIndex(null);
    setShowTimerModal(true);
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

  // Apple HIG: system font, large touch targets, spacing, color
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#000' : '#fff' }]}> 
      <View style={{ flex: 1, flexDirection: 'column' }}>
        {/* Set tracker */}
        <View style={styles.setTrackerContainer}>
          <FlatList
            data={Array.from({ length: sets }, (_, i) => i + 1)}
            horizontal
            keyExtractor={item => item.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.setCircle,
                  item <= currentSet && styles.setCircleActive,
                  running && styles.disabled,
                  isDark && styles.setCircleDark,
                ]}
                onLongPress={() => { if (!running) { setEditSets(String(sets)); setShowSetModal(true); } }}
                disabled={running}
                accessibilityLabel={`Set ${item}`}
                accessible
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {/* No number/text inside the set circle */}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.setTrackerList}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Centered content: countdown timer */}
        <View style={styles.centeredContentContainer}>
          <Text style={[styles.timerText, isDark && styles.timerTextDark]}>{formatTime(secondsLeft)}</Text>
        </View>

        {/* Bottom container: rest time selector and action button or action bar */}
        <View style={[styles.bottomContainer, { marginTop: 'auto' }]}>
          <View style={styles.timerSelectorContainer}>
            {timers.map((t, i) => {
              const isSelected = timerSelectionMode && selectedTimers.includes(t);
              return (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.timerPill,
                    t === selectedTimer && !timerSelectionMode && styles.timerPillActive,
                    running && styles.disabled,
                    isSelected && styles.timerPillSelected,
                    isDark && styles.timerPillDark,
                  ]}
                  onPress={() => {
                    if (timerSelectionMode) {
                      handleTimerSelect(i);
                    } else if (!running) {
                      handleSelectTimer(t);
                    }
                  }}
                  onLongPress={() => {
                    if (!running && !timerSelectionMode) handleTimerLongPress(i);
                  }}
                  disabled={running}
                  accessibilityLabel={`Rest timer ${t / 60} minutes`}
                  accessible
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[
                    styles.timerPillText,
                    t === selectedTimer && !timerSelectionMode && styles.timerPillTextActive,
                    isDark && styles.timerPillTextDark,
                  ]}>{t < 60 ? `${t}''` : `${t / 60}’`}</Text>
                  {isSelected && (
                    <View style={styles.checkmarkCircleWrap}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.timerPill, running && styles.disabled, isDark && styles.timerPillDark]}
              onPress={() => { if (!running) handleAddTimer(); }}
              disabled={running}
              accessibilityLabel="Add timer"
              accessible
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {/* Show action bar or action button depending on selection mode */}
          <View style={[styles.actionButtonContainer, timerSelectionMode && { gap: 12 }]}>
            {timerSelectionMode ? (
              <>
                <TouchableOpacity
                  style={[styles.actionBarButton, { backgroundColor: isDark ? '#222' : '#F2F2F7' }]}
                  onPress={handleEditTimer}
                  disabled={selectedTimers.length !== 1}
                  accessibilityLabel="Edit selected timer"
                  accessible
                >
                  <Ionicons name="pencil" size={24} color={selectedTimers.length === 1 ? '#007AFF' : '#ccc'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBarButton, { backgroundColor: isDark ? '#222' : '#F2F2F7' }]}
                  onPress={handleRemoveTimers}
                  disabled={timers.length - selectedTimers.length < 1 || selectedTimers.length === 0}
                  accessibilityLabel="Remove selected timers"
                  accessible
                >
                  <Ionicons name="trash" size={24} color={timers.length - selectedTimers.length >= 1 && selectedTimers.length > 0 ? '#007AFF' : '#ccc'} />
                </TouchableOpacity>
              </>
            ) : (
              running ? (
                <TouchableOpacity
                  style={styles.fab}
                  onPress={() => setRunning(false)}
                  activeOpacity={0.8}
                  accessibilityLabel="Cancel timer"
                  accessible
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={32} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.fab}
                  onPress={handleStartPause}
                  activeOpacity={0.8}
                  accessibilityLabel="Start timer"
                  accessible
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="play" size={32} color="#fff" />
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </View>

      {/* Modal for editing sets */}
      <Modal visible={showSetModal} transparent animationType="slide" onRequestClose={() => setShowSetModal(false)}>
        <TouchableWithoutFeedback onPress={() => { setShowSetModal(false); Keyboard.dismiss(); }}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.modalSheetHIG, isDark && styles.modalSheetHIGDark]}>
                <Text style={styles.modalTitle}>Edit Sets</Text>
                <TextInput
                  style={[styles.modalInputHIGFull, isDark && styles.modalInputHIGFullDark]}
                  keyboardType="numeric"
                  value={editSets}
                  onChangeText={setEditSets}
                  placeholder="Number of sets"
                  maxLength={2}
                  accessible
                  accessibilityLabel="Set count input"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={() => { if (isValidSetInput()) { const n = Math.max(1, parseInt(editSets) || 1); setSets(n); setCurrentSet(1); setShowSetModal(false); } }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Add Timer Modal */}
      <Modal visible={showAddTimerModal} transparent animationType="slide" onRequestClose={() => { setShowAddTimerModal(false); setTimerInput(''); }}>
        <TouchableWithoutFeedback onPress={() => { setShowAddTimerModal(false); setTimerInput(''); Keyboard.dismiss(); }}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.modalSheetHIG, isDark && styles.modalSheetHIGDark]}>
                <Text style={styles.modalTitle}>Add Timer</Text>
                <TextInput
                  style={[styles.modalInputHIGFull, isDark && styles.modalInputHIGFullDark]}
                  keyboardType="numeric"
                  value={timerInput}
                  onChangeText={setTimerInput}
                  placeholder="Seconds"
                  maxLength={4}
                  accessible
                  accessibilityLabel="Timer input"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={() => { if (isValidTimerInput()) handleAddTimerSave(); }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Edit Timer Modal */}
      <Modal visible={showEditTimerModal} transparent animationType="slide" onRequestClose={() => { setShowEditTimerModal(false); setTimerInput(''); setTimerEditIndex(null); setTimerSelectionMode(false); setSelectedTimers([]); }}>
        <TouchableWithoutFeedback onPress={() => { setShowEditTimerModal(false); setTimerInput(''); setTimerEditIndex(null); setTimerSelectionMode(false); setSelectedTimers([]); Keyboard.dismiss(); }}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.modalSheetHIG, isDark && styles.modalSheetHIGDark]}>
                <Text style={styles.modalTitle}>Edit Timer</Text>
                <TextInput
                  style={[styles.modalInputHIGFull, isDark && styles.modalInputHIGFullDark]}
                  keyboardType="numeric"
                  value={timerInput}
                  onChangeText={setTimerInput}
                  placeholder="Seconds"
                  maxLength={4}
                  accessible
                  accessibilityLabel="Timer input"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={() => { if (isValidTimerInput()) handleEditTimerSave(); }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  setTrackerContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  setTrackerList: {
    gap: 12,
    paddingHorizontal: 16,
  },
  setCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setCircleActive: {
    backgroundColor: '#007AFF',
  },
  setCircleDark: {
    backgroundColor: '#222',
  },
  setCircleText: {
    fontSize: 17,
    color: '#222',
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  setCircleTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '700',
    color: '#222',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
    letterSpacing: 2,
  },
  timerTextDark: {
    color: '#fff',
  },
  timerSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  timerPill: {
    minWidth: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    paddingHorizontal: 12,
  },
  timerPillActive: {
    backgroundColor: '#007AFF',
  },
  timerPillDark: {
    backgroundColor: '#222',
  },
  timerPillText: {
    fontSize: 20,
    color: '#222',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  timerPillTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  timerPillTextDark: {
    color: '#fff',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#222',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  modalInput: {
    width: 80,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  modalButtonText: {
    fontSize: 17,
    color: '#222',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  disabled: {
    opacity: 0.5,
  },
  fabRunning: {
    // Optionally style FAB differently when running
  },
  timerPillSelected: {
    backgroundColor: '#F2F2F7',
    borderWidth: 0,
  },
  timerPillTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  checkmarkCircleWrap: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerActionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
    marginTop: 8,
    zIndex: 10,
  },
  actionBarButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalSheetHIG: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
  },
  modalInputHIG: {
    width: 120,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
    backgroundColor: '#F2F2F7',
  },
  modalInputHIGFull: {
    width: '100%',
    maxWidth: 320,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
    backgroundColor: '#F2F2F7',
  },
  modalInputHIGFullDark: {
    backgroundColor: '#222',
    color: '#fff',
    borderColor: '#333',
  },
  modalActionsHIG: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
  },
  modalButtonHIG: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionsHIGSingle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  centeredContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
  },
  bottomContainer: {
    width: '100%',
    paddingBottom: 32,
    paddingTop: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    zIndex: 2,
  },
  actionButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 48,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalSheetHIGDark: {
    backgroundColor: '#18181A',
  },
});
