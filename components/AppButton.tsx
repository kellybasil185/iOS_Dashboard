import React, { useState } from 'react';
import { 
  Pressable, 
  StyleSheet, 
  Text, 
  View, 
  useColorScheme,
  Linking
} from 'react-native';
import Animated, { 
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { App } from '@/types';
import { getIconForApp } from '@/utils/icons';

interface AppButtonProps {
  app: App;
  index: number;
  categoryColor?: string;
}

export default function AppButton({ app, index, categoryColor }: AppButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isLoading, setIsLoading] = useState(false);
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
      opacity: opacity.value
    };
  });
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { 
      damping: 15, 
      stiffness: 150 
    });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { 
      damping: 15, 
      stiffness: 150 
    });
  };
  
  const openApp = async () => {
    try {
      setIsLoading(true);
      await Linking.openURL(app.url);
    } catch (error) {
      console.error('Error opening URL:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  React.useEffect(() => {
    opacity.value = withDelay(
      index * 50,
      withSequence(
        withSpring(1, {
          damping: 20,
          stiffness: 100
        })
      )
    );
    
    translateY.value = withDelay(
      index * 50,
      withSpring(0, {
        damping: 20,
        stiffness: 100
      })
    );
  }, []);
  
  const Icon = getIconForApp(app.id);
  const backgroundColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const iconColor = categoryColor || (isDark ? '#FFFFFF' : '#000000');
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Animated.View style={[
        styles.buttonContainer, 
        { backgroundColor },
        isLoading && styles.loadingButton
      ]}>
        <Pressable
          style={styles.button}
          onPress={openApp}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
          disabled={isLoading}
        >
          <View style={styles.iconContainer}>
            <Icon size={32} color={iconColor} />
          </View>
          <Text 
            style={[
              styles.label, 
              { color: isDark ? '#FFFFFF' : '#000000' },
              isLoading && { opacity: 0.5 }
            ]}
            numberOfLines={1}
          >
            {app.name}
          </Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '33.333%',
    padding: 8,
  },
  buttonContainer: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingButton: {
    opacity: 0.7,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    minHeight: 100,
  },
  iconContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});