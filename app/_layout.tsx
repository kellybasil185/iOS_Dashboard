import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();
  const colorScheme = useColorScheme();

  return (
    <>
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#F2F2F7',
        }
      }}>
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