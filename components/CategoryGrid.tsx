import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { categories } from '@/utils/data';
import CategoryButton from './CategoryButton';

export default function CategoryGrid() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Animated.View 
      entering={FadeInUp.duration(500).delay(200)}
      exiting={FadeOutDown.duration(300)}
      style={styles.container}
    >
      <View style={styles.grid}>
        {categories.map((category, index) => (
          <CategoryButton 
            key={category.id}
            category={category}
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