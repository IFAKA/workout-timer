import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface SetCircleProps {
  active: boolean;
  onLongPress?: () => void;
  disabled?: boolean;
  isDark?: boolean;
  accessibilityLabel?: string;
}

export function SetCircle({ active, onLongPress, disabled, isDark, accessibilityLabel }: SetCircleProps) {
  return (
    <TouchableOpacity
      style={[
        styles.setCircle,
        active ? styles.setCircleActive : (isDark ? styles.setCircleDark : null),
        disabled && styles.disabled,
      ]}
      onLongPress={onLongPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessible
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {/* No number/text inside the set circle */}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  setCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setCircleActive: {
    backgroundColor: '#3399FF',
  },
  setCircleDark: {
    backgroundColor: '#222',
  },
  disabled: {
    opacity: 0.5,
  },
}); 