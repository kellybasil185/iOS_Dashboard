import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Animated, { FadeIn, FadeInLeft } from 'react-native-reanimated';

export default function DashboardHeader() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Animated.View 
      entering={FadeInLeft.duration(300)} 
      style={styles.container}
    >
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
        Dashboard
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});