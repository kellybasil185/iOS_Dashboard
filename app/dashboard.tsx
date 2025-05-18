import React from 'react';
import { SafeAreaView, StyleSheet, useColorScheme } from 'react-native';
import DashboardHeader from '@/components/DashboardHeader';
import CategoryGrid from '@/components/CategoryGrid';
import { getStatusBarHeight } from '@/utils/statusBar';

export default function Dashboard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <SafeAreaView style={[
      styles.container, 
      { backgroundColor: isDark ? '#000' : '#F2F2F7' }
    ]}>
      <DashboardHeader />
      <CategoryGrid />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: getStatusBarHeight(),
  },
});