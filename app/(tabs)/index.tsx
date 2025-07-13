import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ModalSheet } from '../../components/ModalSheet';
import { SetCircle } from '../../components/SetCircle';
import { TimerPill } from '../../components/TimerPill';
import { useSets } from '../../features/sets/useSets';
import { useTimer } from '../../features/timer/useTimer';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function TimerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fontFamily = Platform.select({ ios: 'System', android: 'Roboto' });

  // Timer and sets hooks
  const timer = useTimer();
  const sets = useSets();

  // Helper for dark mode input styles
  const inputTextColor = isDark ? '#fff' : '#222';
  const inputBgColor = isDark ? '#222' : '#F2F2F7';

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      justifyContent: 'flex-start',
      backgroundColor: isDark ? '#000' : '#fff',
    },
    setTrackerContainer: {
      alignItems: 'center',
      marginTop: Platform.OS === 'android' ? 64 : 24,
      marginBottom: 8,
    },
    setTrackerList: {
      gap: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
    },
    timerText: {
      fontSize: 64,
      fontWeight: '700',
      color: isDark ? '#fff' : '#222',
      fontFamily,
      letterSpacing: 2,
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
      marginTop: 'auto',
    },
    timerSelectorContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    actionButtonContainer: {
      width: '100%',
      alignItems: 'center',
      marginTop: 48,
      marginBottom: Platform.OS === 'android' ? 32 : 0,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
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
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1, flexDirection: 'column' }}>
        {/* Set tracker */}
        <View style={styles.setTrackerContainer}>
          <View style={styles.setTrackerList}>
            {Array.from({ length: timer.sets }, (_, i) => (
              <SetCircle
                key={i}
                active={i + 1 <= timer.currentSet}
                onLongPress={() => { if (!timer.running) { sets.setEditSets(String(timer.sets)); sets.openSetModal(); } }}
                disabled={timer.running}
                isDark={isDark}
                accessibilityLabel={`Set ${i + 1}`}
              />
            ))}
          </View>
        </View>

        {/* Centered content: countdown timer */}
        <View style={styles.centeredContentContainer}>
          <Text style={styles.timerText}>{timer.formatTime(timer.secondsLeft)}</Text>
        </View>

        {/* Bottom container: rest time selector and action button or action bar */}
        <View style={styles.bottomContainer}>
          <View style={styles.timerSelectorContainer}>
            {timer.timers.map((t, i) => {
              return (
                <TimerPill
                  key={t}
                  value={t}
                  selected={timer.timerSelectionMode ? timer.selectedTimers.includes(t) : t === timer.selectedTimer}
                  onPress={() => {
                    if (timer.timerSelectionMode) {
                      timer.handleTimerSelect(i);
                    } else if (!timer.running) {
                      timer.handleSelectTimer(t);
                    }
                  }}
                  onLongPress={() => {
                    if (!timer.running && !timer.timerSelectionMode) timer.handleTimerLongPress(i);
                  }}
                  disabled={timer.running}
                  isDark={isDark}
                  selectionMode={timer.timerSelectionMode}
                />
              );
            })}
            {/* Add timer button */}
            <TimerPill
              value={-1}
              selected={false}
              onPress={() => { if (!timer.running) timer.handleAddTimer(); }}
              disabled={timer.running}
              isDark={isDark}
              selectionMode={false}
            />
          </View>
          {/* Show action bar or action button depending on selection mode */}
          <View style={[styles.actionButtonContainer, timer.timerSelectionMode && { gap: 12 }]}> 
            {timer.timerSelectionMode ? (
              <>
                <TouchableOpacity
                  style={[styles.fab, { backgroundColor: isDark ? '#222' : '#F2F2F7' }, timer.selectedTimers.length !== 1 && { opacity: 0.4 }]}
                  onPress={timer.handleEditTimer}
                  disabled={timer.selectedTimers.length !== 1}
                  accessibilityLabel="Edit selected timer"
                  accessible
                >
                  <Ionicons name="pencil" size={24} color={timer.selectedTimers.length === 1 ? '#007AFF' : '#ccc'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.fab, { backgroundColor: isDark ? '#222' : '#F2F2F7' }, (timer.timers.length - timer.selectedTimers.length < 1 || timer.selectedTimers.length === 0) && { opacity: 0.4 }]}
                  onPress={timer.handleRemoveTimers}
                  disabled={timer.timers.length - timer.selectedTimers.length < 1 || timer.selectedTimers.length === 0}
                  accessibilityLabel="Remove selected timers"
                  accessible
                >
                  <Ionicons name="trash" size={24} color={timer.timers.length - timer.selectedTimers.length >= 1 && timer.selectedTimers.length > 0 ? '#007AFF' : '#ccc'} />
                </TouchableOpacity>
              </>
            ) : (
              timer.running ? (
                <TouchableOpacity
                  style={styles.fab}
                  onPress={() => timer.setRunning(false)}
                  onLongPress={() => {
                    timer.setCurrentSet(1);
                    timer.setRunning(false);
                  }}
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
                  onPress={timer.handleStartPause}
                  onLongPress={() => {
                    timer.setCurrentSet(1);
                    timer.setRunning(false);
                  }}
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
      <ModalSheet
        visible={sets.showSetModal}
        onClose={sets.closeSetModal}
        isDark={isDark}
        title="Edit Sets"
      >
        <TextInput
          style={{
            width: '100%',
            height: 56,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#E5E5EA',
            fontSize: 28,
            textAlign: 'center',
            marginBottom: 32,
            fontFamily,
            backgroundColor: inputBgColor,
            color: inputTextColor,
          }}
          keyboardType="numeric"
          value={sets.editSets}
          onChangeText={text => sets.setEditSets(text.replace(/[^\d]/g, ''))}
          placeholder="Number of sets"
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          maxLength={2}
          accessible
          accessibilityLabel="Set count input"
          returnKeyType="done"
          blurOnSubmit={true}
          onSubmitEditing={sets.saveSets}
        />
      </ModalSheet>
      {/* Add Timer Modal */}
      <ModalSheet
        visible={timer.showAddTimerModal}
        onClose={() => { timer.setShowAddTimerModal(false); timer.setTimerInput(''); }}
        isDark={isDark}
        title="Add Timer"
      >
        <TextInput
          style={{
            width: '100%',
            height: 56,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#E5E5EA',
            fontSize: 28,
            textAlign: 'center',
            marginBottom: 32,
            fontFamily,
            backgroundColor: inputBgColor,
            color: inputTextColor,
          }}
          keyboardType="numeric"
          value={timer.timerInput}
          onChangeText={text => timer.setTimerInput(text.replace(/[^\d]/g, ''))}
          placeholder="Seconds"
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          maxLength={4}
          accessible
          accessibilityLabel="Timer input"
          returnKeyType="done"
          blurOnSubmit={true}
          onSubmitEditing={() => { if (timer.isValidTimerInput()) timer.handleAddTimerSave(); }}
        />
      </ModalSheet>
      {/* Edit Timer Modal */}
      <ModalSheet
        visible={timer.showEditTimerModal}
        onClose={() => { timer.setShowEditTimerModal(false); timer.setTimerInput(''); timer.setTimerEditIndex(null); timer.exitTimerSelectionMode(); }}
        isDark={isDark}
        title="Edit Timer"
      >
        <TextInput
          style={{
            width: '100%',
            height: 56,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#E5E5EA',
            fontSize: 28,
            textAlign: 'center',
            marginBottom: 32,
            fontFamily,
            backgroundColor: inputBgColor,
            color: inputTextColor,
          }}
          keyboardType="numeric"
          value={timer.timerInput}
          onChangeText={text => timer.setTimerInput(text.replace(/[^\d]/g, ''))}
          placeholder="Seconds"
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          maxLength={4}
          accessible
          accessibilityLabel="Timer input"
          returnKeyType="done"
          blurOnSubmit={true}
          onSubmitEditing={() => { if (timer.isValidTimerInput()) timer.handleEditTimerSave(); }}
        />
      </ModalSheet>
    </SafeAreaView>
  );
}
