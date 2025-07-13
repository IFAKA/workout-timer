import { useAudioPlayer } from 'expo-audio';

const beepSource = require('../assets/sounds/beep.mp3');

export function useBeepPlayer() {
  return useAudioPlayer(beepSource);
}

export async function playBeep(beepPlayer: ReturnType<typeof useBeepPlayer>) {
  try {
    beepPlayer.seekTo(0);
    beepPlayer.play();
  } catch (e) {
    // fallback handled by caller
  }
} 