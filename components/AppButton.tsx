// Conceptual update for gwewn/ios/ios-68e9577bddf0c4664dc99c0df95844e9e902dd60/components/AppButton.tsx

import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  Linking,
  Modal, // For the options modal
  TouchableOpacity, // For buttons within the options modal
} from 'react-native';
import Animated, {
  // ... your existing reanimated imports
  useSharedValue,
  withSpring,
  // ...
} from 'react-native-reanimated';
import { App } from '@/types';
import { getIconForApp } from '@/utils/icons';
import EmbeddedWebViewModal from './EmbeddedWebViewModal'; // Previously discussed

interface AppButtonProps {
  app: App;
  index: number;
  categoryColor?: string;
}

export default function AppButton({ app, index, categoryColor }: AppButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isLoadingExternal, setIsLoadingExternal] = useState(false); // For "Go to website"
  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
  const [isEmbeddedWebViewVisible, setIsEmbeddedWebViewVisible] = useState(false);

  const scale = useSharedValue(1);
  // ... any other animation shared values for entrance, etc.

  // ... (useEffect for entrance animations and animatedStyle for press effect remain similar)

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  // SINGLE TAP now shows options
  const handleAppButtonTap = () => {
    setIsOptionsModalVisible(true);
  };

  const openAppExternally = async () => {
    setIsOptionsModalVisible(false); // Close options if open
    try {
      setIsLoadingExternal(true);
      await Linking.openURL(app.url);
    } catch (error) {
      console.error('Error opening URL externally:', error);
      // Optionally, show an alert to the user
    } finally {
      setIsLoadingExternal(false);
    }
  };

  const openAppEmbedded = () => {
    setIsOptionsModalVisible(false);
    setIsEmbeddedWebViewVisible(true);
  };

  const Icon = getIconForApp(app.id);
  const backgroundColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const iconColor = categoryColor || (isDark ? '#FFFFFF' : '#000000');
  // ... (your existing animatedStyle for press and entrance)

  return (
    <>
      <Animated.View style={[styles.container /*, yourEntranceAnimationStyle*/]}>
        <Animated.View
          style={[
            styles.buttonContainer,
            { backgroundColor },
            isLoadingExternal && styles.loadingButton, // Visual feedback if external link is loading
            /* animatedStyle for press effect */
          ]}
        >
          <Pressable
            style={styles.button}
            onPress={handleAppButtonTap} // MODIFIED: Single tap shows options
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
            disabled={isLoadingExternal}
          >
            {/* ... Icon and Text ... */}
             <View style={styles.iconContainer}>
              <Icon size={32} color={iconColor} />
            </View>
            <Text
              style={[
                styles.label,
                { color: isDark ? '#FFFFFF' : '#000000' },
                isLoadingExternal && { opacity: 0.5 }
              ]}
              numberOfLines={1}
            >
              {app.name}
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>

      {/* Options Modal */}
      <Modal
        transparent
        visible={isOptionsModalVisible}
        animationType="fade" // Or "slide" from bottom for action sheet feel
        onRequestClose={() => setIsOptionsModalVisible(false)}
      >
        <Pressable
          style={styles.optionsOverlay} // Dims the background
          onPress={() => setIsOptionsModalVisible(false)} // Close on overlay press
        >
          <View style={[styles.optionsModalContent, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
            <Text style={[styles.optionsTitle, {color: isDark ? '#FFF' : '#000'}]}>{app.name}</Text>
            <TouchableOpacity style={styles.optionButton} onPress={openAppEmbedded}>
              <Text style={[styles.optionText, {color: isDark ? '#0A84FF' : '#007AFF'}]}>Open here</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={openAppExternally}>
              <Text style={[styles.optionText, {color: isDark ? '#0A84FF' : '#007AFF'}]}>Go to website</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, styles.cancelOptionButton]}
              onPress={() => setIsOptionsModalVisible(false)}
            >
              <Text style={[styles.optionText, styles.cancelText, {color: isDark ? '#FF3B30' : '#FF3B30'}]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <EmbeddedWebViewModal
        isVisible={isEmbeddedWebViewVisible}
        url={app.url}
        onClose={() => setIsEmbeddedWebViewVisible(false)}
        appName={app.name}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // ... (Keep your existing styles for .container, .buttonContainer, .button, .iconContainer, .label)
  // Add or refine styles for the options modal
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
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Typical overlay dim
    justifyContent: 'center', // Center the modal vertically
    alignItems: 'center',    // Center the modal horizontally
  },
  optionsModalContent: {
    width: '75%', // Adjust width as desired
    borderRadius: 14, // iOS like rounded corners
    padding: 0, // Padding will be handled by individual option buttons for separators
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionsTitle: {
    fontSize: 13, // Smaller title for action sheet style
    fontWeight: '600',
    color: '#8A8A8E', // iOS secondary label color
    paddingVertical: 12,
    paddingHorizontal: 16,
    textAlign: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60, 60, 67, 0.36)', // iOS separator color
  },
  optionButton: {
    width: '100%',
    paddingVertical: 14, // Standard tap height
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60, 60, 67, 0.36)', // iOS separator color
  },
  cancelOptionButton: {
    borderBottomWidth: 0, // No separator for the last button
    marginTop: 8, // Space between action group and cancel
     borderTopWidth: StyleSheet.hairlineWidth, // Separator for cancel
    borderTopColor: 'rgba(60, 60, 67, 0.36)',
  },
  optionText: {
    fontSize: 17, // Standard iOS action font size
    // color: '#007AFF', // Standard iOS blue
  },
  cancelText: {
    fontWeight: '600', // Cancel is often bold
    // color: '#FF3B30', // Standard iOS red for destructive/cancel
  },
});
