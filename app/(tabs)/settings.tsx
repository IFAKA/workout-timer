import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const [totalSets, setTotalSets] = useState('3');
  const [defaultRest, setDefaultRest] = useState('60');
  const [restOptions, setRestOptions] = useState<number[]>([30, 60, 90, 120, 180]);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    (async () => {
      const storedSets = await AsyncStorage.getItem('totalSets');
      const storedRest = await AsyncStorage.getItem('defaultRest');
      const storedOptions = await AsyncStorage.getItem('restOptions');
      if (storedSets) setTotalSets(storedSets);
      if (storedRest) setDefaultRest(storedRest);
      if (storedOptions) setRestOptions(JSON.parse(storedOptions));
    })();
  }, []);

  const saveSettings = async () => {
    await AsyncStorage.setItem('totalSets', totalSets);
    await AsyncStorage.setItem('defaultRest', defaultRest);
    await AsyncStorage.setItem('restOptions', JSON.stringify(restOptions));
    Alert.alert('Settings Saved', 'Your preferences have been saved.');
    router.back();
  };

  const addRestOption = () => {
    const val = parseInt(newOption, 10);
    if (!isNaN(val) && !restOptions.includes(val)) {
      setRestOptions([...restOptions, val].sort((a, b) => a - b));
      setNewOption('');
    }
  };

  const removeRestOption = (val: number) => {
    setRestOptions(restOptions.filter(opt => opt !== val));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.inputRow}>
        <Text style={styles.label}>Total Sets:</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={totalSets}
          onChangeText={setTotalSets}
        />
      </View>
      <View style={styles.inputRow}>
        <Text style={styles.label}>Default Rest (sec):</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={defaultRest}
          onChangeText={setDefaultRest}
        />
      </View>
      <Text style={styles.label}>Rest Time Options (sec):</Text>
      <FlatList
        data={restOptions}
        keyExtractor={item => item.toString()}
        horizontal
        renderItem={({ item }) => (
          <View style={styles.restOptionItem}>
            <Text style={styles.restOptionText}>{item}</Text>
            <TouchableOpacity onPress={() => removeRestOption(item)} accessibilityLabel={`Remove ${item}s`}>
              <Text style={styles.removeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        style={{ marginBottom: 12 }}
      />
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={newOption}
          onChangeText={setNewOption}
          placeholder="Add option"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addRestOption} accessibilityLabel="Add rest option">
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.saveBtn} onPress={saveSettings} accessibilityLabel="Save settings">
        <Text style={styles.saveBtnText}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} accessibilityLabel="Cancel">
        <Text style={styles.cancelBtnText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#0a7ea4',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  label: {
    fontSize: 18,
    marginRight: 12,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    minWidth: 60,
    fontSize: 18,
    backgroundColor: '#f9f9f9',
    textAlign: 'center',
  },
  restOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  restOptionText: {
    fontSize: 16,
    color: '#333',
    marginRight: 4,
  },
  removeBtn: {
    color: '#c00',
    fontSize: 18,
    marginLeft: 2,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  addBtn: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginLeft: 8,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  cancelBtnText: {
    color: '#0a7ea4',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 