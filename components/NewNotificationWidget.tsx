import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Image,
  // Dimensions, // Not strictly needed here if using flex
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Trash2 } from 'lucide-react-native'; // Assuming you have this icon
import NotificationDetailsModal from './NotificationDetailsModal'; // Assuming this path is correct

// Mock data for development (keep this or your API fetching logic)
const mockNotifications = [
  {
    id: 1,
    source: 'Telegram',
    content: 'New signal alert for BTC/USD',
    received_at: new Date().toISOString(),
    chat_id: 12345,
    chat_title: 'Crypto Signals',
  },
  {
    id: 2,
    source: 'Telegram',
    content: 'Market analysis for today',
    received_at: new Date(Date.now() - 3600000).toISOString(),
    chat_id: 67890,
    chat_title: 'Trading Group',
  },
  {
    id: 3,
    source: 'TradingView',
    content: 'Price alert: BTC/USD above 50000',
    received_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 4,
    source: 'Telegram',
    content: 'Another message here for testing scroll',
    received_at: new Date(Date.now() - 8200000).toISOString(),
    chat_id: 12345,
    chat_title: 'Crypto Signals',
  }
];

interface Notification {
  id: number;
  source: string;
  content: string;
  received_at: string;
  chat_id?: number;
  chat_title?: string;
}

const DELETE_BUTTON_WIDTH = 80; // Width of the delete button

// Reusable Swipeable List Item Component
interface SwipeableItemProps {
  source: string;
  summaryText: string;
  latestTimestamp: string;
  isDark: boolean;
  onPressItem: () => void;
  onDelete: () => void;
}

const SwipeableSourceItem: React.FC<SwipeableItemProps> = ({
  source,
  summaryText,
  latestTimestamp,
  isDark,
  onPressItem,
  onDelete,
}) => {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0); // <--- Add this

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Activate after 10px horizontal movement
    .onStart(() => {
      // Store the current position when the gesture starts
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      // Calculate the new position based on start + current translation
      let newTranslateX = startX.value + event.translationX;

      // Clamp the value:
      // 1. Don't allow swiping right past the starting point (0)
      // 2. Don't allow swiping left past the delete button width
      newTranslateX = Math.min(0, newTranslateX);
      newTranslateX = Math.max(-DELETE_BUTTON_WIDTH, newTranslateX);

      translateX.value = newTranslateX;
    })
    .onEnd((event) => {
      // Use the threshold: If swiped more than half (or 1.5) the delete width...
      if (translateX.value < -DELETE_BUTTON_WIDTH / 1.5) {
        // ...snap fully open
        translateX.value = withTiming(-DELETE_BUTTON_WIDTH);
      } else {
        // ...otherwise, snap back closed
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleDelete = () => {
    // Animate back before deleting or just delete
    translateX.value = withTiming(0, {}, () => {
        runOnJS(onDelete)();
    });
  };

  return (
    <View style={styles.sourceItemContainer}>
      {/* Delete Button (Positioned Behind) */}
      <TouchableOpacity
        style={[styles.deleteButtonContainer, { width: DELETE_BUTTON_WIDTH }]}
        onPress={handleDelete}
      >
        <Trash2 color="#FFFFFF" size={24} />
      </TouchableOpacity>

      {/* Swipeable Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.sourceSummary,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
            animatedStyle, // Apply swipe translation here
          ]}
        >
          <TouchableOpacity
            style={styles.summaryContent}
            onPress={() => {
              if (translateX.value !== 0) { // If swiped, snap back before opening modal
                translateX.value = withTiming(0);
                return;
              }
              onPressItem();
            }}
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
              <Text style={[styles.summaryText, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
                {summaryText}
              </Text>
              <Text style={[styles.timestamp, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
                Latest: {latestTimestamp}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};


export default function NewNotificationWidget() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications); // Using mock for now
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('');

  // In a real app, fetch notifications from API here
  // useEffect(() => { /* Fetch logic */ }, []);

  const getSourceNotifications = (source: string) => {
    return notifications.filter((n) => n.source === source);
  };

  const getLatestNotification = (source: string) => {
    return notifications
      .filter((n) => n.source === source)
      .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())[0];
  };

  const formatTimestamp = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    // ... (rest of your formatDate logic)
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440)  return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleDeleteSourceNotifications = useCallback((sourceToDelete: string) => {
    console.log(`Deleting all notifications for source: ${sourceToDelete}`);
    // This will eventually be an API call:
    // await fetch(`http://localhost:3001/api/notifications/source/${sourceToDelete}`, { method: 'DELETE' });
    setNotifications((prev) =>
      prev.filter((notification) => notification.source !== sourceToDelete)
    );
    // Optionally re-fetch or update summaries
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
  
  // Determine order based on latest notification from any source
  const latestTelegram = getLatestNotification('Telegram');
  const latestTradingView = getLatestNotification('TradingView');
  
  let orderedSources: ('Telegram' | 'TradingView')[] = [];
  if (latestTelegram && latestTradingView) {
    orderedSources = new Date(latestTelegram.received_at) > new Date(latestTradingView.received_at)
      ? ['Telegram', 'TradingView']
      : ['TradingView', 'Telegram'];
  } else if (latestTelegram) {
    orderedSources = ['Telegram'];
  } else if (latestTradingView) {
    orderedSources = ['TradingView'];
  }


  if (notifications.length === 0) {
    return (
      <View style={[styles.widgetContainer, { backgroundColor: isDark ? '#120016' : '#F0F0F0' }]}>
         <Text style={[styles.widgetHeaderTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Notifications
        </Text>
        <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#666666' }]}>
          No notifications yet.
        </Text>
      </View>
    );
  }

  return (
    // Wrap with GestureHandlerRootView if not already at a higher level in your app
    // For Expo Router, this is often handled by the root layout.
    // <GestureHandlerRootView style={{ flex: 1 }}> 
      <View style={[styles.widgetContainer, { backgroundColor: isDark ? '#120016' : '#F0F0F0' }]}>
        <Text style={[styles.widgetHeaderTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Notifications
        </Text>
        {/* Render summaries in determined order */}
        {orderedSources.map(source => renderSourceSection(source))}

        <NotificationDetailsModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          source={selectedSource}
          notifications={getSourceNotifications(selectedSource)}
          // Pass any other necessary props like isDark, formatDate, getIconSource
          isDark={isDark}
          formatDate={formatTimestamp} // Assuming modal uses a compatible formatDate
          getIconSource={(sourceName: string) => sourceName === 'Telegram' ? require('@/assets/icons/telegram.png') : require('@/assets/icons/tradingview.png')} // Simplified for modal
        />
      </View>
    // </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  widgetContainer: { // This is the root View of NewNotificationWidget
    flex: 1, // Allow it to fill the height provided by notificationsContainer
    paddingVertical: 8, // Reduced padding, parent has some

    justifyContent: 'center', // If content is less than allocated height
  },
  widgetHeaderTitle: {
    fontSize: 20, // Or s(20) if you prefer scaling all text
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16, // Add padding here if widgetContainer doesn't have it
  },
  sourceItemContainer: { // Container for each swipeable row (summary + delete button)
    marginBottom: 5,
    marginHorizontal: 16, // Horizontal margin for each item card
    borderRadius: 25,     // Rounded corners for the item card itself
    backgroundColor: '#FF3B30', // Background for the delete button area
    overflow: 'hidden', // Important for rounded corners with swipe
  },
  sourceSummary: { // The visible, swipeable part of the item
    // borderRadius: 12, // borderRadius is on sourceItemContainer now
    // overflow: 'hidden', // Not needed here if parent has it
    // backgroundColor will be set dynamically based on isDark
    // height: 100, // Let content define height or set minHeight
  },
  summaryContent: { // Content inside the swipeable part
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    minHeight: 80, // Ensure a decent tappable height
  },
  sourceIcon: {
    width: 36, // Slightly smaller icon for summary
    height: 36,
    marginRight: 16,
  },
  summaryTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  sourceName: {
    fontSize: 16,
    fontWeight: 'bold', // Bolder source name
    marginBottom: 2,
  },
  summaryText: {
    fontSize: 13,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  deleteButtonContainer: { // This is the area BEHIND the swipeable item
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_BUTTON_WIDTH, // Fixed width for the delete button area
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#FF3B30', // Background set on sourceItemContainer
  },
  // deleteButton TouchableOpacity itself doesn't need much style if it fills the container
  // deleteButton: {
  //   // Style for the touchable area if needed
  // },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 30, // More padding for empty state
  },
});