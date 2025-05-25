import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Image,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';

interface NotificationDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  source: string;
  isDark: boolean;
  formatDate: (dateString: string | undefined) => string;
  getIconSource: (sourceName: string) => any;
  notifications: Array<{
    id: number;
    content: string;
    received_at: string;
    chat_title?: string;
  }>;
}

const AnimatedModal = Animated.createAnimatedComponent(View);

export default function NotificationDetailsModal({
  isVisible,
  onClose,
  source,
  notifications,
}: NotificationDetailsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isVisible ? 1 : 0, {
          damping: 15,
          stiffness: 150,
        }),
      },
    ],
    opacity: withTiming(isVisible ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }),
  }));

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'telegram':
        return require('@/assets/icons/telegram.png');
      case 'tradingview':
        return require('@/assets/icons/tradingview.png');
      default:
        return require('@/assets/icons/default.png');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeFormat = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    } as const;

    const dateFormat = {
      month: 'short',
      day: 'numeric',
      ...timeFormat,
    } as const;

    return isToday
      ? date.toLocaleString('en-US', timeFormat)
      : date.toLocaleString('en-US', dateFormat);
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <AnimatedModal
          style={[
            styles.modalContent,
            {
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            },
            animatedStyle,
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <Image
                source={getSourceIcon(source)}
                style={styles.sourceIcon}
              />
              <Text
                style={[
                  styles.modalTitle,
                  { color: isDark ? '#FFFFFF' : '#000000' },
                ]}
              >
                {source} Notifications
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {notifications.map((notification) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationItem,
                  {
                    borderBottomColor: isDark ? '#2C2C2E' : '#E5E5EA',
                  },
                ]}
              >
                {notification.chat_title && (
                  <Text
                    style={[
                      styles.chatTitle,
                      { color: isDark ? '#FFFFFF' : '#000000' },
                    ]}
                  >
                    {notification.chat_title}
                  </Text>
                )}
                <Text
                  style={[
                    styles.notificationContent,
                    { color: isDark ? '#FFFFFF' : '#000000' },
                  ]}
                >
                  {notification.content}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    { color: isDark ? '#8E8E93' : '#8E8E93' },
                  ]}
                >
                  {formatDate(notification.received_at)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </AnimatedModal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '50%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  notificationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
  },
});