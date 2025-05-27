// gwewn/ios/ios-68e9577bddf0c4664dc99c0df95844e9e902dd60/components/CustomIcon.tsx
import React from 'react';
import { Image, StyleSheet, ImageStyle } from 'react-native'; // Added ImageStyle
import { getCustomIcon } from '@/utils/icons';

interface CustomIconProps {
  name: string;
  size?: number;
  style?: ImageStyle; // Changed to ImageStyle for better type safety
  tintColor?: string; // Added tintColor prop
}

const CustomIcon: React.FC<CustomIconProps> = ({ name, size = 40, style, tintColor }) => {
  const source = getCustomIcon(name);

  return (
    <Image
      source={source}
      style={[
        styles.icon,
        { width: size, height: size },
        tintColor ? { tintColor } : {}, // Apply tintColor if provided
        style, // Allow overriding styles
      ]}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    resizeMode: 'contain',
  },
});

export default CustomIcon;
