// gwewn/ios/ios-68e9577bddf0c4664dc99c0df95844e9e902dd60/components/EmbeddedWebViewModal.tsx
import React, { useState } from 'react'; // Import useState
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  useColorScheme,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { X } from 'lucide-react-native';

interface EmbeddedWebViewModalProps {
  isVisible: boolean;
  url: string;
  onClose: () => void;
  appName: string;
}

const EmbeddedWebViewModal: React.FC<EmbeddedWebViewModalProps> = ({
  isVisible,
  url,
  onClose,
  appName,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(url);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setIsLoading(navState.loading);
    setCurrentUrl(navState.url);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet" // More native feel for a "popup" on iOS
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#F2F2F7' }}>
        <View style={[styles.modalHeader, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#000' }]} numberOfLines={1}>
            {appName}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>
        {isLoading && (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color={isDark ? '#FFFFFF' : '#000000'}
          />
        )}
        <WebView
          source={{ uri: url }}
          style={{ flex: 1, opacity: isLoading ? 0 : 1 }} // Hide WebView while loading to show indicator
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          allowsInlineMediaPlayback={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true} // Show default loader initially (optional)
          renderLoading={() => ( // Custom loader while startInLoadingState is true
            <ActivityIndicator
              style={StyleSheet.absoluteFill}
              size="large"
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA', // Standard iOS separator color
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center', // Center title if no back button
    marginHorizontal: 30, // Give space for close button
  },
  closeButton: {
    padding: 8, // Make it easier to tap
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 1,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }], // Center based on size
    zIndex: 10,
  },
});

export default EmbeddedWebViewModal;
