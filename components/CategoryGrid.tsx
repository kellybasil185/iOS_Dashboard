// In components/CategoryGrid.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native'; // Removed useColorScheme as isDark wasn't used here
import Animated, {
  FadeInUp, // Or your preferred entrance animation (e.g., FadeIn, BounceIn)
  FadeOutDown,
  Easing, // Import Easing for smoother animations
  FadeIn
} from 'react-native-reanimated';
import { categories } from '@/utils/data';
import CategoryButton from './CategoryButton';

export default function CategoryGrid() {
  return (
    <Animated.View
      style={styles.container} // Ensure this style is on the Animated.View
      entering={FadeIn // All buttons will animate as part of this single animation
        .duration(200)  // Duration for the grid to animate in
        .easing(Easing.inOut(Easing.quad)) // Makes the animation feel smoother
        .withInitialValues({
          opacity: 0,
          transform: [{ translateY: 20 }] // Initial state: invisible and slightly down
        })}
      exiting={FadeOutDown.duration(300)} // How the grid disappears
    >
      <View style={styles.grid}>
        {categories.map((category, index) => (
          <CategoryButton
            key={category.id}
            category={category}
            // The 'index' prop is no longer needed by CategoryButton for animation delay,
            // but you can keep it if it's used for other non-animation purposes.
            index={index}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});