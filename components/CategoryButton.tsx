// In components/CategoryButton.tsx
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn, // Using a simple FadeIn for each button
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  Easing // For the button's fade easing
} from 'react-native-reanimated';
import { Category } from '@/types';
import { getIconForCategory } from '@/utils/icons';

interface CategoryButtonProps {
  category: Category;
  index: number;
}

export default function CategoryButton({ category, index }: CategoryButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  const handlePressOut = () => scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  const navigateToCategory = () => router.push(`/category/${category.id}`);

  const Icon = getIconForCategory(category.id);
  const backgroundColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const iconColor = category.color || (isDark ? '#FFFFFF' : '#000000');

  return (
    <Animated.View // This Animated.View will handle the button's individual quick fade
      style={styles.container}
      entering={FadeIn
        .duration(300) // The "small fadein animation for maybe like 200ms duration"
        .easing(Easing.out(Easing.ease)) // A gentle ease-out for the fade
        .withInitialValues({
          opacity: 0, // Each button starts transparent
        })}
      // No 'exiting' here unless you want individual button exit animations
    >
      <Animated.View style={[ // Inner Animated.View for scaling (remains the same)
        styles.buttonContainer,
        { backgroundColor },
        animatedStyle
      ]}>
        <Pressable
          style={styles.button}
          onPress={navigateToCategory}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
        >
          <View style={styles.iconContainer}>
            <Icon color={iconColor} size={32} />
          </View>
          <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
            {category.name}
          </Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
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