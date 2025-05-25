import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import NotificationDetailsModal from './NotificationDetailsModal';
import ConfirmationPopup from './ConfirmationPopup';

// Mock data for development
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
  },
];

interface Notification {
  id: number;
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
  onDelete: () => void;
}

const SWIPE_THRESHOLD = -100;

const SwipeableSourceItem: React.FC<SwipeableItemProps> = ({
  source,
  summaryText,
  latestTimestamp,
  isDark,
  onPressItem,
  onDelete,
}) => {
  const translateX = useSharedValue(0);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  const showConfirmation = useCallback(() => {
    setIsConfirmationVisible(true);
  }, []);

  const handleConfirmDelete = () => {
    setIsConfirmationVisible(false);
    onDelete();
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = Math.min(0, event.translationX);
    })
    .onEnd((event) => {
      if (translateX.value < SWIPE_THRESHOLD) {
        runOnJS(showConfirmation)();
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.sourceItemContainer}>
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
                  ? require('@/assets/icons/telegram.png')
                  : require('@/assets/icons/tradingview.png')
              }
              style={styles.sourceIcon}
            />
            <View style={styles.summaryTextContainer}>
              <Text
                style={[
                  styles.sourceName,
                  { color: isDark ? '#FFFFFF' : '#000000' },
                ]}
              >
                {source}
              </Text>
              <Text
                style={[
                  styles.summaryText,
                  { color: isDark ? '#8E8E93' : '#8E8E93' },
                ]}
              >
                {summaryText}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  { color: isDark ? '#8E8E93' : '#8E8E93' },
                ]}
              >
                Latest: {latestTimestamp}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>

      <ConfirmationPopup
        isVisible={isConfirmationVisible}
        source={source}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmationVisible(false)}
      />
    </View>
  );
};

export default function NewNotificationWidget() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('');

  const getSourceNotifications = (source: string) => {
    return notifications.filter((n) => n.source === source);
  };

  const getLatestNotification = (source: string) => {
    return notifications
      .filter((n) => n.source === source)
      .sort(
        (a, b) =>
          new Date(b.received_at).getTime() - new Date(a.received_at).getTime(),
      )[0];
  };

  const formatTimestamp = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleDeleteSourceNotifications = useCallback(
    (sourceToDelete: string) => {
      console.log(`Deleting all notifications for source: ${sourceToDelete}`);
      setNotifications((prev) =>
        prev.filter((notification) => notification.source !== sourceToDelete),
      );
    },
    [],
  );

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
        ? `${sourceNotifications.length} new message${
            sourceNotifications.length > 1 ? 's' : ''
          }${uniqueChats ? ` from ${uniqueChats} chat${uniqueChats > 1 ? 's' : ''}` : ''}`
        : `${sourceNotifications.length} new alert${
            sourceNotifications.length > 1 ? 's' : ''
          }`;

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
    orderedSources =
      new Date(latestTelegram.received_at) >
      new Date(latestTradingView.received_at)
        ? ['Telegram', 'TradingView']
        : ['TradingView', 'Telegram'];
  } else if (latestTelegram) {
    orderedSources = ['Telegram'];
  } else if (latestTradingView) {
    orderedSources = ['TradingView'];
  }

  if (notifications.length === 0) {
    return (
      <View
        style={[
          styles.widgetContainer,
          { backgroundColor: isDark ? '#1F0027' : '#F0F0F0' },
        ]}
      >
        <Text
          style={[
            styles.widgetHeaderTitle,
            { color: isDark ? '#FFFFFF' : '#000000' },
          ]}
        >
          Notifications
        </Text>
        <Text
          style={[
            styles.emptyText,
            { color: isDark ? '#8E8E93' : '#666666' },
          ]}
        >
          No notifications yet.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.widgetContainer,
        { backgroundColor: isDark ? '#120016' : '#F0F0F0' },
      ]}
    >
      <Text
        style={[
          styles.widgetHeaderTitle,
          { color: isDark ? '#FFFFFF' : '#000000' },
        ]}
      >
        Notifications
      </Text>
      {orderedSources.map((source) => renderSourceSection(source))}

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
  );
}

const styles = StyleSheet.create({
  widgetContainer: {
    flex: 1,
    paddingVertical: 8,
    justifyContent: 'flex-start',
  },
  widgetHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sourceItemContainer: {
    marginBottom: 5,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
    overflow: 'hidden',
  },
  sourceSummary: {
    borderRadius: 20,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  summaryText: {
    fontSize: 13,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 30,
  },
});