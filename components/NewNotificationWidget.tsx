// components/NewNotificationWidget.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Image,
  ActivityIndicator, // Added for loading state
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'; // Added GestureHandlerRootView
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
// Make sure you have an icon for delete, e.g., from lucide-react-native
// import { Trash2 } from 'lucide-react-native'; 
import NotificationDetailsModal from './NotificationDetailsModal';
import ConfirmationPopup from './ConfirmationPopup';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For caching

// --- Configuration for API and Caching ---
const API_BASE_URL = 'https://02ac-41-66-199-205.ngrok-free.app'; // e.g., 'https://your-id.ngrok-free.app' or http://localhost:3001
const NOTIFICATIONS_ENDPOINT = `${API_BASE_URL}/api/notifications`;
const POLLING_INTERVAL = 15000; // 15 seconds
const CACHE_KEY = 'cachedNotifications';
const CACHE_SIZE = 20; // How many notifications to keep in cache and display initially
const FETCH_LIMIT = 20; // How many notifications to fetch per API call

interface Notification {
  id: number; // Assuming ID is a number from the database
  source: string;
  content: string;
  received_at: string;
  chat_id?: number;
  chat_title?: string;
}

interface SwipeableItemProps {
  source: string;
  summaryText: string;
  latestTimestamp: string;
  isDark: boolean;
  onPressItem: () => void;
  onDelete: () => void; // This will now trigger the confirmation
}

const SWIPE_THRESHOLD = -80; // Adjusted threshold
const DELETE_BUTTON_WIDTH = 80; // For styling if you re-add a visible delete button

const SwipeableSourceItem: React.FC<SwipeableItemProps> = ({
  source,
  summaryText,
  latestTimestamp,
  isDark,
  onPressItem,
  onDelete, // This onDelete is now the one that gets called after confirmation
}) => {
  const translateX = useSharedValue(0);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  const showConfirmation = useCallback(() => {
    setIsConfirmationVisible(true);
  }, []);

  const handleConfirmDelete = () => {
    setIsConfirmationVisible(false);
    onDelete(); // Call the passed onDelete (which will be handleDeleteSourceNotifications)
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Activate after 10px horizontal movement
    .onUpdate((event) => {
      // Allow swipe left (negative translationX) up to delete button width
      // Disallow swipe right (positive translationX beyond 0)
      translateX.value = Math.min(0, Math.max(event.translationX, -DELETE_BUTTON_WIDTH - 20)); // Allow a bit of overswipe
    })
    .onEnd((event) => {
      if (translateX.value < SWIPE_THRESHOLD) {
        // Instead of snapping to reveal a button, we trigger confirmation
        runOnJS(showConfirmation)();
        // Optionally, you could still snap a bit to indicate action, then snap back
        // translateX.value = withSpring(-DELETE_BUTTON_WIDTH / 2); 
        // Or just spring back after confirmation is triggered
        translateX.value = withSpring(0, { damping: 20, stiffness: 150 });
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 150 }); // Snap back closed
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.sourceItemContainer}>
      {/* No visible delete button here anymore, confirmation popup handles it */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.sourceSummary,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
            animatedStyle,
          ]}
        >
          <TouchableOpacity
            style={styles.summaryContent}
            onPress={onPressItem}
            activeOpacity={0.7}
          >
            <Image
              source={
                source === 'Telegram'
                  ? require('@/assets/icons/telegram.png') // Ensure these paths are correct
                  : require('@/assets/icons/tradingview.png')
              }
              style={styles.sourceIcon}
            />
            <View style={styles.summaryTextContainer}>
              <Text style={[styles.sourceName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {source}
              </Text>
              <Text style={[styles.summaryText, { color: isDark ? '#8E8E93' : '#6D6D72' }]}>
                {summaryText}
              </Text>
              <Text style={[styles.timestamp, { color: isDark ? '#8E8E93' : '#6D6D72' }]}>
                Latest: {latestTimestamp}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>

      <ConfirmationPopup
        isVisible={isConfirmationVisible}
        source={source} // Pass the source to the popup for context
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmationVisible(false);
          translateX.value = withSpring(0); // Ensure it springs back if canceled
        }}
      />
    </View>
  );
};

export default function NewNotificationWidget() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  const lastFetchedIdRef = useRef<number | null>(null); // To store the ID of the latest fetched notification

  // --- Data Fetching and Caching ---
  const fetchNotificationsFromAPI = useCallback(async (sinceId: number | null = null, isInitialLoad = false) => {
    if (!isInitialLoad) setIsLoading(true); // Show loader for polling, unless it's the very first load handled by initial state
    setError(null);
    let url = NOTIFICATIONS_ENDPOINT;
    const params = new URLSearchParams();

    if (sinceId) {
      params.append('since_id', String(sinceId));
    }
    params.append('limit', String(FETCH_LIMIT));

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    console.log("Fetching notifications from URL:", url);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Fetch error response:", errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: Notification[] = await response.json();
      console.log("Fetched data:", data);

      if (data.length > 0) {
        setNotifications((prevNotifications) => {
          const existingIds = new Set(prevNotifications.map(n => n.id));
          const uniqueNewData = data.filter(n => !existingIds.has(n.id));
          
          const combined = [...uniqueNewData, ...prevNotifications]
            .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime()) // Ensure always sorted by newest
            .slice(0, CACHE_SIZE); // Keep only CACHE_SIZE items

          if (combined.length > 0) {
            lastFetchedIdRef.current = combined[0].id; // Update last fetched ID
          }
          AsyncStorage.setItem(CACHE_KEY, JSON.stringify(combined)).catch(e => console.error('Failed to cache notifications', e));
          return combined;
        });
      } else if (!sinceId) { // Initial load with no data
        setNotifications([]);
         AsyncStorage.setItem(CACHE_KEY, JSON.stringify([])).catch(e => console.error('Failed to cache notifications', e));
      }
    } catch (e: any) {
      console.error("Fetch notifications error:", e);
      setError(e.message || 'Failed to fetch notifications. Check server connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    const loadAndFetchInitial = async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsedCache: Notification[] = JSON.parse(cached);
          if (parsedCache.length > 0) {
            setNotifications(parsedCache);
            lastFetchedIdRef.current = parsedCache[0].id; // Set from cache initially
          }
        }
      } catch (e) {
        console.error('Failed to load cached notifications', e);
      }
      // Fetch fresh on mount, potentially with since_id from cache
      fetchNotificationsFromAPI(lastFetchedIdRef.current, true); 
    };

    loadAndFetchInitial();

    const intervalId = setInterval(() => {
      console.log('Polling for new notifications since ID:', lastFetchedIdRef.current);
      fetchNotificationsFromAPI(lastFetchedIdRef.current);
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchNotificationsFromAPI]);
  // --- End Data Fetching ---

  const getSourceNotifications = (source: string) => {
    return notifications.filter((n) => n.source === source);
  };

  const getLatestNotification = (source: string) => {
    return notifications
      .filter((n) => n.source === source)
      .sort((a,b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())[0];
  };

  const formatTimestamp = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    // ... (your existing formatDate logic) ...
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleDeleteSourceNotifications = useCallback(async (sourceToDelete: string) => {
    console.log(`Attempting to delete notifications for source: ${sourceToDelete} via API`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/source/${sourceToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete ${sourceToDelete} notifications`);
      }
      const result = await response.json();
      console.log(result.message);
      // Optimistically update UI or re-fetch
      setNotifications((prev) =>
        prev.filter((notification) => notification.source !== sourceToDelete)
      );
      lastFetchedIdRef.current = null; // Reset to fetch all on next poll or clear if needed
      // Optionally, trigger a fresh fetch for all sources or just clear the deleted one
      // fetchNotificationsFromAPI(null, true); // Re-fetch all
    } catch (e: any) {
      console.error(`Error deleting ${sourceToDelete} notifications:`, e);
      setError(`Failed to delete ${sourceToDelete}: ${e.message}`);
    }
  }, []);

  const renderSourceSection = (source: 'Telegram' | 'TradingView') => {
    const sourceNotifications = getSourceNotifications(source);
    if (sourceNotifications.length === 0) return null;

    const latest = getLatestNotification(source);
    const uniqueChats =
      source === 'Telegram'
        ? new Set(sourceNotifications.map((n) => n.chat_title || n.chat_id)).size
        : null;

    const summaryText =
      source === 'Telegram'
        ? `${sourceNotifications.length} new message${sourceNotifications.length > 1 ? 's' : ''}${uniqueChats ? ` from ${uniqueChats} chat${uniqueChats > 1 ? 's' : ''}` : ''}`
        : `${sourceNotifications.length} new alert${sourceNotifications.length > 1 ? 's' : ''}`;

    return (
      <SwipeableSourceItem
        key={source}
        source={source}
        summaryText={summaryText}
        latestTimestamp={formatTimestamp(latest?.received_at)}
        isDark={isDark}
        onPressItem={() => {
          setSelectedSource(source);
          setIsModalVisible(true);
        }}
        onDelete={() => handleDeleteSourceNotifications(source)}
      />
    );
  };

  const latestTelegram = getLatestNotification('Telegram');
  const latestTradingView = getLatestNotification('TradingView');
  let orderedSources: ('Telegram' | 'TradingView')[] = [];

  if (latestTelegram && latestTradingView) {
    orderedSources = new Date(latestTelegram.received_at).getTime() > new Date(latestTradingView.received_at).getTime()
      ? ['Telegram', 'TradingView'] : ['TradingView', 'Telegram'];
  } else if (latestTelegram) {
    orderedSources = ['Telegram'];
  } else if (latestTradingView) {
    orderedSources = ['TradingView'];
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.widgetContainer, { backgroundColor: isDark ? '#48418c' : '#969596' }]}>
        <Text style={[styles.widgetHeaderTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Notifications
        </Text>

        {isLoading && notifications.length === 0 && ( // Show loader only on initial load if empty
          <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#000000'} style={{ marginVertical: 20 }}/>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        {!isLoading && notifications.length === 0 && !error && (
          <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#666666' }]}>
            No notifications yet.
          </Text>
        )}
        
        {/* Render summaries only if not loading initially OR if notifications exist */}
        {(!isLoading || notifications.length > 0) && !error && orderedSources.map((source) => renderSourceSection(source))}

        <NotificationDetailsModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          source={selectedSource}
          notifications={getSourceNotifications(selectedSource)}
          isDark={isDark}
          formatDate={formatTimestamp}
          getIconSource={(sourceName: string) =>
            sourceName === 'Telegram'
              ? require('@/assets/icons/telegram.png')
              : require('@/assets/icons/tradingview.png')
          }
        />
      </View>
    </GestureHandlerRootView>
  );
}

// Styles (ensure styles from your previous correct version are here)
const styles = StyleSheet.create({
  widgetContainer: {
    flex: 1, // Allow widget to take available space given by dashboard.tsx
    paddingVertical: 8, // Overall padding for the widget card
    // Removed marginHorizontal, should be handled by parent in dashboard.tsx if needed
    // Removed borderRadius, should be handled by parent in dashboard.tsx if needed
  },
  widgetHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16, // Increased space after header
    paddingHorizontal: 16, // Padding for the header text
  },
  sourceItemContainer: {
    marginBottom: 12,
    marginHorizontal: 16, // Indent items within the widget
    borderRadius: 12,
    // backgroundColor: '#FF3B30', // Removed: Delete button is not visually persistent
    overflow: 'hidden', // Important for rounded corners with swipe
  },
  sourceSummary: {
    borderRadius: 12, // Rounded corners for the swipeable item itself
    // backgroundColor will be set dynamically
  },
  summaryContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    minHeight: 80,
  },
  sourceIcon: {
    width: 36,
    height: 36,
    marginRight: 16,
  },
  summaryTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  sourceName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 3,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 40,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 20,
    color: 'red',
    marginHorizontal: 16,
  }
});