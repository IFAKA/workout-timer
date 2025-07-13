import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TimerPillProps {
  value: number;
  selected: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  isDark?: boolean;
  selectionMode?: boolean;
}

export function TimerPill({ value, selected, onPress, onLongPress, disabled, isDark, selectionMode }: TimerPillProps) {
  const showBlueBorder = selected && !selectionMode && value !== -1;
  return (
    <TouchableOpacity
      style={[
        styles.timerPill,
        selected && styles.timerPillActive,
        disabled && styles.disabled,
        isDark && styles.timerPillDark,
        showBlueBorder && styles.timerPillSelectedBorder,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      accessibilityLabel={`Rest timer ${value === -1 ? 'add' : value / 60 + ' minutes'}`}
      accessible
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {value === -1 ? (
        <Ionicons name="add" size={24} color="#007AFF" />
      ) : (
        <Text style={[
          styles.timerPillText,
          selected && styles.timerPillTextActive,
          isDark && styles.timerPillTextDark,
          { fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }) }
        ]}>{value < 60 ? `${value}''` : `${value / 60}’`}</Text>
      )}
      {selectionMode && selected && value !== -1 && (
        <View style={[styles.checkmarkCircleWrap, { position: 'absolute', top: -2, right: -2, zIndex: 2 }] }>
          <Ionicons name="checkmark" size={16} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  disabled: {
    opacity: 0.5,
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
  timerPillSelectedBorder: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
}); 