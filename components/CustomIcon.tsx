import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { getCustomIcon } from '@/utils/icons';

interface CustomIconProps {
  name: string;
  size?: number;
  style?: any;
}

const CustomIcon: React.FC<CustomIconProps> = ({ name, size = 32, style }) => {
  const source = getCustomIcon(name);

  return <Image source={source} style={[styles.icon, { width: size, height: size }, style]} />;
};

const styles = StyleSheet.create({
  icon: {
    resizeMode: 'contain',
  },
});

export default CustomIcon;
