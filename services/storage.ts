import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getItem<T = string>(key: string): Promise<T | null> {
  const value = await AsyncStorage.getItem(key);
  if (value == null) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
}

export async function setItem<T = string>(key: string, value: T): Promise<void> {
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  await AsyncStorage.setItem(key, str);
}

export async function multiGet(keys: string[]): Promise<Record<string, any>> {
  const entries = await AsyncStorage.multiGet(keys);
  return Object.fromEntries(entries.map(([k, v]) => [k, v ? JSON.parse(v) : null]));
}

export async function multiSet(obj: Record<string, any>): Promise<void> {
  const entries: [string, string][] = Object.entries(obj).map(([k, v]) => [k, JSON.stringify(v)] as [string, string]);
  await AsyncStorage.multiSet(entries);
} 