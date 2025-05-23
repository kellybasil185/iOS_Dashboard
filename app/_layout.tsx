// ./app/_layout.tsx
import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { preloadAllIcons } from '@/utils/preloadAssets';

// 1. Prevent the splash from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // your existing framework-ready logic
  useFrameworkReady();

  const colorScheme = useColorScheme();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    (async () => {
      // 2. Run your icon preloader
      try {
        await preloadAllIcons();
      } catch (err) {
        console.warn('Failed to preload icons', err);
      } finally {
        // 3. Hide splash and render the rest
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    })();
  }, []);

  // 4. Don’t render your navigation until everything is ready
  if (!appReady) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme === 'dark' ? '#000' : '#F2F2F7',
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen
          name="category/[id]"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
