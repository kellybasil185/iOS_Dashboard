// components/NotificationWidget.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStatusBarHeight } from '@/utils/statusBar';

interface Notification {
  id: number;
  source: string;
  content: string;
  received_at: string;
}

const API_URL = 'https://a47b-41-66-199-205.ngrok-free.app/api/notifications';
const POLLING_INTERVAL = 20000; // 20 seconds
const CACHE_KEY = 'notifications';
const CACHE_SIZE = 20;

const NotificationWidget = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const loadCachedNotifications = async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          setNotifications(JSON.parse(cached));
        }
      } catch (e) {
        console.error('Failed to load cached notifications', e);
      }
    };

    const fetchNotifications = async (sinceId: number | null = null) => {
      setIsLoading(true);
      setError(null);
      let url = API_URL;
      if (sinceId) {
        url += `?since_id=${sinceId}`;
      }

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Notification[] = await response.json();

        setNotifications((prevNotifications) => {
          const newNotifications = sinceId ? [...data, ...prevNotifications].slice(0, CACHE_SIZE) : data;
          return newNotifications;
        });

        // Update cache
        try {
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data.slice(0, CACHE_SIZE)));
        } catch (e) {
          console.error('Failed to cache notifications', e);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to fetch notifications');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadCachedNotifications();
    fetchNotifications();

    const intervalId = setInterval(() => {
      const latestNotificationId = notifications.length > 0 ? notifications[0].id : null;
      if (latestNotificationId) {
        fetchNotifications(latestNotificationId);
      } else {
        fetchNotifications();
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  const getIconSource = (source: string) => {
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

    return isToday ? date.toLocaleString('en-US', timeFormat) : date.toLocaleString('en-US', dateFormat);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
        Notifications
      </Text>
      {isLoading && <ActivityIndicator size="small" color={isDark ? '#fff' : '#000'} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {notifications.length === 0 && !isLoading && !error && (
        <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#000' }]}>No notifications yet.</Text>
      )}
      <ScrollView showsVerticalScrollIndicator={false}> 
        {notifications.map((notification) => (
          <View key={notification.id} style={[styles.notificationItem]}>
            <View style={styles.notificationHeader}>
              <Image
                source={getIconSource(notification.source)}
                style={styles.sourceIcon}
              />
              <Text style={[styles.source, { color: isDark ? '#fff' : '#000' }]}>
                {notification.source}
              </Text>
              <Text style={[styles.timestamp, { color: isDark ? '#fff' : '#000' }]}>
                {formatDate(notification.received_at)}
              </Text>
            </View>
            <Text style={[styles.content, { color: isDark ? '#fff' : '#000' }]}>
              {notification.content}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  notificationItem: {
    padding: 10,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sourceIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  source: {
    fontWeight: '600',
    marginRight: 4,
  },
  timestamp: {
    fontSize: 10,
    color: 'gray',
  },
  content: {
    fontSize: 12,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default NotificationWidget;
