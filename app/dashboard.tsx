// app/dashboard.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import DashboardHeader from '@/components/DashboardHeader';
import CategoryGrid from '@/components/CategoryGrid';
import Calculator from '@/components/Calculator';
import { Calculator as CalculatorIcon } from 'lucide-react-native';
import NewNotificationWidget from '@/components/NewNotificationWidget';
import { getStatusBarHeight } from '@/utils/statusBar';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

// Adjust these percentages as needed:
const GRID_PERCENT = 0.30;        // 30% of screen height
const NOTIFS_PERCENT = 0.30;     // 30% of screen height

export default function Dashboard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);

  const toggleCalculator = () => {
    setIsCalculatorVisible((prev) => !prev);
  };

  const gridHeight = WINDOW_HEIGHT * GRID_PERCENT;
  const notificationsHeight = WINDOW_HEIGHT * NOTIFS_PERCENT;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}
    >
      <DashboardHeader />

      {/* Fixed-percentage height for CategoryGrid */}
      <View style={{ height: gridHeight }}>
        <CategoryGrid />
      </View>

      {/* Fixed-percentage height for Notifications */}
      <View
        style={[
          styles.notificationsContainer,
          {
            height: notificationsHeight,
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          },
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
