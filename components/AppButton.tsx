// gwewn/ios/ios-68e9577bddf0c4664dc99c0df95844e9e902dd60/components/AppButton.tsx
import React, { useState, useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  Linking,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { App } from '@/types';
import { getIconForApp } from '@/utils/icons';

interface AppButtonProps {
  app: App;
  index: number;
  categoryColor?: string; // We receive it, but might not use it for app icon tinting
}

export default function AppButton({ app, index, categoryColor }: AppButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isLoading, setIsLoading] = useState(false);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animatedPressStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const entranceAnimationStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }]
    };
  });

  useEffect(() => {
    opacity.value = withDelay(
      index * 50,
      withSpring(1, { damping: 20, stiffness: 100 })
    );
    translateY.value = withDelay(
      index * 50,
      withSpring(0, { damping: 20, stiffness: 100 })
    );
  }, [index, opacity, translateY]);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const openAppExternally = async () => {
    try {
      setIsLoading(true);
      await Linking.openURL(app.url);
    } catch (error) {
      console.error('Error opening URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = getIconForApp(app.id);
  const backgroundColor = isDark ? '#1C1C1E' : '#FFFFFF';

  // ---MODIFICATION START---
  // Remove categoryColor from tinting logic for app icons.
  // App icons should generally show their original colors.
  // tintColor might only be used if the icons were monochrome templates.
  // For now, let's not apply any tintColor to app icons to ensure originals are shown.
  const iconSpecificTintColor = undefined; // Or: isDark ? '#FFFFFF' : '#000000' if they were monochrome AND needed theme-based tint
  // ---MODIFICATION END---

  return (
    <>
      <Animated.View style={[styles.container, entranceAnimationStyle]}>
        <Animated.View
          style={[
            styles.buttonContainer,
            { backgroundColor },
            isLoading && styles.loadingButton,
            animatedPressStyle,
          ]}
        >
          <Pressable
            style={styles.button}
            onPress={openAppExternally}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
            disabled={isLoading}
          >
            <View style={styles.iconContainer}>
              {/* Apply the revised tintColor logic */}
              <Icon size={32} tintColor={iconSpecificTintColor} />
            </View>
            <Text
              style={[
                styles.label,
                { color: isDark ? '#FFFFFF' : '#000000' },
                isLoading && { opacity: 0.5 },
              ]}
              numberOfLines={1}
            >
              {app.name}
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '33.333%',
    padding: 8,
  },
  buttonContainer: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingButton: {
    opacity: 0.7,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    minHeight: 100,
  },
  iconContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});
