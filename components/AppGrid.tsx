import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import AppButton from './AppButton';
import { App } from '@/types';

interface AppGridProps {
  apps: App[];
  categoryColor?: string;
}

export default function AppGrid({ apps, categoryColor }: AppGridProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {apps.map((app, index) => (
          <AppButton 
            key={app.id}
            app={app}
            index={index}
            categoryColor={categoryColor}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});