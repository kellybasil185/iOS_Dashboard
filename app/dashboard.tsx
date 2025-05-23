// app/dashboard.tsx
import React, { useState } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  useColorScheme,
  TouchableOpacity,
  View // View might not be explicitly needed if not used directly
} from 'react-native';
import DashboardHeader from '@/components/DashboardHeader';
import CategoryGrid from '@/components/CategoryGrid';
import { getStatusBarHeight } from '@/utils/statusBar'; // Ensure this path is correct
import Calculator from '@/components/Calculator'; // Ensure this path is correct
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
      {/* Conditionally render DashboardHeader and CategoryGrid */}
      {!isCalculatorVisible && (
        <>
          <DashboardHeader />
          <CategoryGrid />
        </>
      )}
      
      {/* The Calculator toggle button remains visible */}
      {/* You might want to adjust its style or hide it if the calculator is open, depending on UX preference */}
      <TouchableOpacity style={styles.calculatorButton} onPress={toggleCalculator}>
        <CalculatorIcon color={isDark ? '#fff' : '#000'} size={24} />
      </TouchableOpacity>
      
      {/* Render the Calculator component */}
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
    // paddingTop is removed here if Calculator handles its own safe area, 
    // or if you want DashboardHeader to be inside the safe area padding.
    // The original paddingTop: getStatusBarHeight() might be better applied
    // inside the conditional block for dashboard content.
  },
  // Style for the calculator container to ensure it overlays or fills correctly
  calculatorContainer: {
    ...StyleSheet.absoluteFillObject, // Makes the calculator fill the SafeAreaView
    zIndex: 10, // Ensure calculator is on top if other elements are not hidden
    // backgroundColor might be set by Calculator component itself
  },
  calculatorButton: {
    position: 'absolute',
    top: getStatusBarHeight() + 16, // Position based on status bar height
    right: 16,
    padding: 10,
    borderRadius: 50,
    zIndex: 20, // Ensure button is above the calculator if it's an overlay
                // and also above dashboard content.
    // Consider changing background or style if calculator is open for better UX
  },
});