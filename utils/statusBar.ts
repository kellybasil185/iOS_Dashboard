import { Platform, StatusBar } from 'react-native';

export const getStatusBarHeight = (): number => {
  if (Platform.OS === 'ios') {
    return 48; // Approximate status bar height on iOS
  }
  
  return StatusBar.currentHeight || 0;
};