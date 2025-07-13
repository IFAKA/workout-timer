import React from 'react';
import { Keyboard, Modal, Platform, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  isDark?: boolean;
  title?: string;
}

export function ModalSheet({ visible, onClose, children, isDark, title }: ModalSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={() => { onClose(); Keyboard.dismiss(); }}>
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalSheetHIG, isDark && styles.modalSheetHIGDark]}>
              {title && <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#222', fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }) }]}>{title}</Text>}
              <View style={{ width: '100%' }}>{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
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
  modalSheetHIGDark: {
    backgroundColor: '#18181A',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#222',
  },
}); 