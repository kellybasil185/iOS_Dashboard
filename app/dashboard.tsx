// app/dashboard.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  View,
} from 'react-native';
import DashboardHeader from '@/components/DashboardHeader';
import CategoryGrid from '@/components/CategoryGrid';
import Calculator from '@/components/Calculator';
import { Calculator as CalculatorIcon } from 'lucide-react-native';
import NewNotificationWidget from '@/components/NewNotificationWidget';
import { getStatusBarHeight } from '@/utils/statusBar';

export default function Dashboard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);

  const toggleCalculator = () => {
    setIsCalculatorVisible((prev) => !prev);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}
    >
      <DashboardHeader />

      {/* Category grid takes 2 parts */}
      <View style={{ flex: 2 }}>
        <CategoryGrid />
      </View>

      {/* Notifications take 1 part */}
      <View
        style={[
          styles.notificationsContainer,
          { flex: 2.1, backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
        ]}
      >
        <NewNotificationWidget />
      </View>

      {/* Placeholder for any other widget — also 1 part */}
      <View style={{ flex: 0.4 }}>
        {/* swap this empty View for your next widget */}
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
  notificationsContainer: {
    marginBottom: 8,
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
