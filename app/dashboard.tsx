// Updated Dashboard Layout: app/dashboard.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  View,
  ScrollView,
  LayoutChangeEvent,
} from 'react-native';
import DashboardHeader from '@/components/DashboardHeader';
import CategoryGrid from '@/components/CategoryGrid';
import { getStatusBarHeight } from '@/utils/statusBar';
import Calculator from '@/components/Calculator';
import { Calculator as CalculatorIcon } from 'lucide-react-native';
import NewNotificationWidget from '@/components/NewNotificationWidget';
import { categories } from '@/utils/data';

const numColumns = 2;
const numRows = Math.ceil(categories.length / numColumns);

export default function Dashboard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);
  const [gridHeight, setGridHeight] = useState(0);

  const toggleCalculator = () => {
    setIsCalculatorVisible((prev) => !prev);
  };

  // Calculate height for two rows of the category grid
  const rowHeight = useMemo(() => {
    return gridHeight && numRows && typeof gridHeight === 'number' && gridHeight > 0
      ? gridHeight / numRows
      : 0;
  }, [gridHeight, numRows]);

  const notificationHeight = useMemo(() => {
    return rowHeight * 2.5;
  }, [rowHeight]);

  const handleGridLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (typeof height === 'number' && height > 0) {
      setGridHeight(height);
    }
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}
    >
      <DashboardHeader />

      {/* Measure grid height */}
      <View style={{ flex: 0.62 }} onLayout={handleGridLayout}>
        <CategoryGrid />
      </View>

      {/* Notifications below CategoryGrid, height = two grid rows */}
      <View
        style={[
          styles.notificationsContainer,
          { height: notificationHeight, backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
        ]}
      >
        <NewNotificationWidget />
      </View>

      <TouchableOpacity style={styles.calculatorButton} onPress={toggleCalculator}>
        <CalculatorIcon color={isDark ? '#fff' : '#000'} size={24} />
      </TouchableOpacity>

      {isCalculatorVisible && (
        <View style={styles.calculatorContainer}>
          <Calculator />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  notificationsContainer: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 16,
    // NotificationWidget scrolls internally
  },
  weatherContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  calculatorContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  calculatorButton: {
    position: 'absolute',
    top: getStatusBarHeight() + 16,
    right: 16,
    padding: 10,
    borderRadius: 50,
    zIndex: 20,
  },
});