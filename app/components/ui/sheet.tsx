import React from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';

interface SheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: string[];
  backgroundStyle?: object;
}

export const Sheet: React.FC<SheetProps> = ({
  isVisible,
  onClose,
  children,
  snapPoints = ['50%'],
  backgroundStyle = {}
}) => {
  const translateY = React.useRef(new Animated.Value(0)).current;
  const windowHeight = Dimensions.get('window').height;
  const sheetHeight = parseInt(snapPoints[0]) / 100 * windowHeight;

  React.useEffect(() => {
    if (isVisible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11
      }).start();
    } else {
      translateY.setValue(sheetHeight);
    }
  }, [isVisible]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY } = event.nativeEvent;
      
      if (translationY > 100) {
        onClose();
        Animated.timing(translateY, {
          toValue: sheetHeight,
          duration: 200,
          useNativeDriver: true
        }).start();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11
        }).start();
      }
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[
                styles.sheet,
                {
                  height: sheetHeight,
                  transform: [{
                    translateY: translateY.interpolate({
                      inputRange: [-sheetHeight, 0, sheetHeight],
                      outputRange: [-sheetHeight/4, 0, sheetHeight],
                      extrapolate: 'clamp'
                    })
                  }],
                  ...backgroundStyle
                }
              ]}
            >
              <View style={styles.handle} />
              {children}
            </Animated.View>
          </PanGestureHandler>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginBottom: 8,
  },
}); 