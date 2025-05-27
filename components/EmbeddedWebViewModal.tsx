// gwewn/ios/ios-68e9577bddf0c4664dc99c0df95844e9e902dd60/components/EmbeddedWebViewModal.tsx
import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  useColorScheme,
  ActivityIndicator,
  SafeAreaView,
  Platform,
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
  const webViewRef = useRef<WebView>(null); // Ref to access WebView methods if needed

  // When the modal becomes visible, ensure we are loading the initial URL
  // This also handles the case where the same modal might be reused for different apps (though less likely with current setup)
  useEffect(() => {
    if (isVisible) {
      setIsLoading(true); // Show loader immediately
      // If the webViewRef is available and pointing to a loaded page that's not the current URL,
      // you might choose to reload, but typically source prop change handles this.
    }
  }, [isVisible, url]);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setIsLoading(navState.loading);
  };

  const injectedJavaScriptBeforeContentLoaded = `
    // You could try to inject JS here if needed for specific site workarounds, but it's complex.
    // For example, trying to override something or set a flag.
    // window.isEmbeddedInMyApp = true;
    true; // Must return true
  `;

  if (!isVisible) {
    return null;
  }

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

        {/* The ActivityIndicator will be shown by renderLoading or if isLoading is true before WebView renders */}
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={{ flex: 1, backgroundColor: isDark ? '#000' : '#FFF' }} // Set BG color for webview itself
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onLoadProgress={({ nativeEvent }) => {
            // You can use nativeEvent.progress (0-1) for a more granular loading bar if desired
            if (nativeEvent.progress === 1) {
              setIsLoading(false);
            } else {
              setIsLoading(true);
            }
          }}
          onError={(syntheticEvent) => {
            setIsLoading(false);
            const { nativeEvent } = syntheticEvent;
            console.warn(`WebView error loading ${appName} (${url}): `, nativeEvent.description);
            // Consider showing an error message to the user within the modal here
            // e.g., set an error state and display a Text component
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true} // Important for sites that use localStorage/sessionStorage
          cacheEnabled={true} // Default on iOS, ensures HTTP caching for resources
          // cacheMode: 'LOAD_CACHE_ELSE_NETWORK', // More relevant for Android, iOS handles caching differently
          allowsInlineMediaPlayback={true} // For videos etc.
          sharedCookiesEnabled={true} // If you need to share cookies with Safari (iOS)
          // userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1" // Uncomment to experiment
          startInLoadingState={true} // Shows renderLoading while the initial HTML is fetched
          renderLoading={() => (
            <ActivityIndicator
              style={styles.loader} // Use absoluteFill if you want it to cover the whole WebView area
              size="large"
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          )}
          // injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded} // Advanced use
        />
        {/* Display a more prominent loader overlay if needed, especially if renderLoading isn't enough */}
        {isLoading && Platform.OS !== 'web' && ( // renderLoading handles initial, this is more for ongoing
             <ActivityIndicator
               style={styles.loaderOverlay}
               size="large"
               color={isDark ? '#777' : '#999'}
             />
           )}
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
    borderBottomWidth: StyleSheet.hairlineWidth, // Use hairlineWidth for subtle separator
    // borderBottomColor: '#E5E5EA', // Light mode separator
    // For dynamic separator color:
    // borderBottomColor: useColorScheme() === 'dark' ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.36)',

  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 30, // Space for close button
  },
  closeButton: {
    padding: 8,
    position: 'absolute', // Ensure it's easily tappable over the title if text is long
    right: 8,
    top: 6, // Adjust to vertically align with title
    zIndex: 1,
  },
  loader: { // This loader is specifically for renderLoading, centered by WebView
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // So it overlays the webview's initial blank state
  },
   loaderOverlay: { // An alternative/additional overlay loader
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure it's above the WebView content
  },
});

export default EmbeddedWebViewModal;
