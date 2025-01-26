import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sheet } from './ui/sheet';

interface ConfirmDialogProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  theme: {
    background: string;
    text: string;
    textSecondary: string;
    surface: string;
  };
  variant?: 'default' | 'destructive';
  showCancel?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  theme,
  variant = 'default',
  showCancel = true
}) => {
  const getConfirmButtonStyle = () => {
    switch (variant) {
      case 'destructive':
        return { backgroundColor: '#FF3B30' };
      default:
        return { backgroundColor: '#007AFF' };
    }
  };

  return (
    <Sheet
      isVisible={isVisible}
      onClose={onClose}
      snapPoints={['25%']}
      backgroundStyle={{ backgroundColor: theme.background }}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
        <View style={styles.buttonContainer}>
          {showCancel && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.surface }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>{cancelText}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.button,
              !showCancel && styles.singleButton,
              getConfirmButtonStyle()
            ]}
            onPress={() => {
              onConfirm();
              onClose();
            }}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  singleButton: {
    flex: 1,
    marginHorizontal: 24,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
}); 