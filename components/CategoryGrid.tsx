// In components/CategoryGrid.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeInUp, // Or just FadeIn if you prefer less vertical movement for the container
  FadeOutDown,
  Easing,
  FadeOut,
  FadeIn
} from 'react-native-reanimated';
import { categories } from '@/utils/data';
import CategoryButton from './CategoryButton';

export default function CategoryGrid() {
  return (
    <Animated.View
      style={styles.container}
      entering={FadeIn // Animates the whole grid container
        .delay(10)      // A brief delay before the grid starts appearing
        .duration(300)  // Duration for the container's animation
        .easing(Easing.inOut(Easing.quad)) // Smooth easing for the container
        .withInitialValues({
          opacity: 0,
          transform: [{ translateY: 0 }] // Container starts invisible and slightly down
        })}
      exiting={FadeOut.duration(300)}
    >
      <View style={styles.grid}>
        {categories.map((category, index) => (
          <CategoryButton
            key={category.id}
            category={category}
            // index is not strictly needed for simultaneous animation, but fine to keep
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