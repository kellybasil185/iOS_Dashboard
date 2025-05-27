// gwewn/ios/ios-68e9577bddf0c4664dc99c0df95844e9e902dd60/components/EmbeddedWebViewModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  useColorScheme,
  ActivityIndicator,
  SafeAreaView,
  Platform, // Import Platform
} from 'react-native';
// Import WebView conditionally or only for native
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
  const [isLoading, setIsLoading] = useState(true); // For iframe, loading is harder to track precisely

  useEffect(() => {
    if (isVisible) {
      setIsLoading(true); // Reset loading state when modal becomes visible
      // For iframe, we can assume it starts loading. True loading state is tricky.
      // A timeout might be used to hide loader if no 'load' event is captured.
      const timer = setTimeout(() => setIsLoading(false), 3000); // Example: hide loader after 3s
      return () => clearTimeout(timer);
    }
  }, [isVisible]);


  if (!isVisible) {
    return null;
  }

  const renderWebView = () => {
    if (Platform.OS === 'web') {
      // For web, use an iframe. Be aware of X-Frame-Options.
      return (
        <iframe
          src={url}
          style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            console.error("Error loading URL in iframe for: ", appName);
            // You might want to show an error message here
          }}
          title={appName}
        />
      );
    } else {
      // For native, use react-native-webview
      return (
        <WebView
          source={{ uri: url }}
          style={{ flex: 1, opacity: isLoading ? 0 : 1 }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={(syntheticEvent) => {
            setIsLoading(false);
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            // Handle error, e.g., show a message
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator
              style={StyleSheet.absoluteFill}
              size="large"
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          )}
        />
      );
    }
  };


  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
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
        {Platform.OS === 'web' && isLoading && ( // Show loader for iframe differently if needed
           <ActivityIndicator
             style={styles.loader}
             size="large"
             color={isDark ? '#FFFFFF' : '#000000'}
           />
        )}
        <View style={styles.webviewContainer}>
          {renderWebView()}
        </View>
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
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 30,
  },
  closeButton: {
    padding: 8,
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 1,
  },
  webviewContainer: { // Added a container for webview/iframe
    flex: 1,
    overflow: 'hidden', // Helps contain the iframe
  },
  loader: { // General loader style
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    zIndex: 10,
  },
});

export default EmbeddedWebViewModal;
