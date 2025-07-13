import { Vibration } from 'react-native';

export function vibrate(duration: number = 400) {
  Vibration.vibrate(duration);
} 