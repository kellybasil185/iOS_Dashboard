// app/dashboard.tsx
import React, { useState } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  useColorScheme,
  TouchableOpacity,
  View
} from 'react-native';
import DashboardHeader from '@/components/DashboardHeader';
import CategoryGrid from '@/components/CategoryGrid';
import { getStatusBarHeight } from '@/utils/statusBar';
import Calculator from '@/components/Calculator';
import { Calculator as CalculatorIcon } from 'lucide-react-native';

export default function Dashboard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);

  const toggleCalculator = () => {
    setIsCalculatorVisible(!isCalculatorVisible);
  };
  
  return (
    <SafeAreaView style={[
      styles.container, 
      { backgroundColor: isDark ? '#000' : '#F2F2F7' }
    ]}>
      <DashboardHeader />
      <CategoryGrid />
      <TouchableOpacity style={styles.calculatorButton} onPress={toggleCalculator}>
        <CalculatorIcon color={isDark ? '#fff' : '#000'} size={24} />
      </TouchableOpacity>
      {isCalculatorVisible && <Calculator />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: getStatusBarHeight(),
  },
  calculatorButton: {
    position: 'absolute',
    top: getStatusBarHeight() + 16,
    right: 16,
    padding: 10,
    borderRadius: 50,
  },
});
