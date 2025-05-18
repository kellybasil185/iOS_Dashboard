import React, { useEffect } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  View, 
  Text, 
  useColorScheme,
  Pressable
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Animated, { 
  FadeInUp, 
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import AppGrid from '@/components/AppGrid';
import { getStatusBarHeight } from '@/utils/statusBar';
import { getCategory } from '@/utils/data';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const categoryId = Array.isArray(id) ? id[0] : id;
  const category = getCategory(categoryId);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  
  const headerOpacity = useSharedValue(0);
  
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 300 });
  }, []);
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });
  
  if (!category) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton} 
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color={isDark ? '#fff' : '#000'} />
            <Text style={[styles.backText, { color: isDark ? '#fff' : '#000' }]}>Back</Text>
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: isDark ? '#fff' : '#000' }]}>
            Category not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Pressable 
          style={styles.backButton} 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={24} color={isDark ? '#fff' : '#000'} />
          <Text style={[styles.backText, { color: isDark ? '#fff' : '#000' }]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
          {category.name}
        </Text>
      </Animated.View>
      
      <Animated.View 
        entering={FadeInUp.delay(100).duration(400)}
        exiting={FadeOutDown.duration(300)}
        style={styles.content}
      >
        <AppGrid apps={category.apps} categoryColor={category.color} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: getStatusBarHeight(),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
    zIndex: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backText: {
    fontSize: 17,
    fontWeight: '500',
    marginLeft: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    width: '100%',
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});