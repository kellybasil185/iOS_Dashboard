// gwewn/ios/ios-68e9577bddf0c4664dc99c0df95844e9e902dd60/utils/icons.tsx
import React from 'react';
import CustomIcon from '@/components/CustomIcon';
import { imageMap } from '@/components/IconRegistry';

// Define props for the cached icon component
interface CachedIconProps {
  size?: number;
  tintColor?: string; // Add tintColor here
  // Add any other props CustomIcon might need in the future
}

const iconCache: { [key: string]: React.FC<CachedIconProps> } = {}; // Update type for iconCache

function getCachedIcon(name: string): React.FC<CachedIconProps> {
  if (iconCache[name]) {
    return iconCache[name];
  }

  // The component now accepts props and forwards them
  const iconComponent: React.FC<CachedIconProps> = (props) => (
    <CustomIcon name={name} {...props} />
  );
  iconCache[name] = iconComponent;
  return iconComponent;
}

// Functions getIconForCategory and getIconForApp remain the same
export function getIconForCategory(id: string) {
  switch (id) {
    case 'trading':
      return getCachedIcon('tradingapp');
    case 'web':
      return getCachedIcon('web');
    case 'entertainment':
      return getCachedIcon('entertainment');
    case 'ai':
      return getCachedIcon('ai');
    case 'others':
      return getCachedIcon('others');
    case 'shopping':
      return getCachedIcon('shopping');
    default:
      return getCachedIcon('default');
  }
}

export function getIconForApp(id: string) {
  switch (id) {
    case 'tradingview':
      return getCachedIcon('tradingview');
    case 'xm':
      return getCachedIcon('xm');
    case 'exness':
      return getCachedIcon('exness');
    case 'metatrader5':
      return getCachedIcon('mt5');
    case 'metatrader4':
      return getCachedIcon('mt4');
    case 'forexfactory':
      return getCachedIcon('forex_factory');
    case 'myfxbook':
      return getCachedIcon('fxbook');
    case 'fundednext':
      return getCachedIcon('fundednext');
    case 'google':
      return getCachedIcon('google');
    case 'gmail':
      return getCachedIcon('gmail');
    case 'icloud':
      return getCachedIcon('icloud');
    case 'telegram':
      return getCachedIcon('telegram');
    case 'gdrive':
      return getCachedIcon('gdrive');
    case 'duckduckgo':
      return getCachedIcon('duckduckgo');
    case 'youtube':
      return getCachedIcon('youtube');
    case 'tiktok':
      return getCachedIcon('tiktok');
    case 'instagram':
      return getCachedIcon('instagram');
    case 'spotify':
      return getCachedIcon('spotify');
    case 'twitch':
      return getCachedIcon('twitch');
    case 'quora':
      return getCachedIcon('quora');
    case 'reddit':
      return getCachedIcon('reddit');
    case 'chatgpt':
      return getCachedIcon('chatgpt');
    case 'gemini':
      return getCachedIcon('gemini');
    case 'pornhub':
      return getCachedIcon('pornhub');
    case 'jiji':
      return getCachedIcon('jiji');
    case 'jumia':
      return getCachedIcon('jumia');
    case 'aliexpress':
      return getCachedIcon('aliexpress');
    case 'amazon':
      return getCachedIcon('amazon');
    case 'stripchat':
      return getCachedIcon('stripchat');
    case 'pintrest':
      return getCachedIcon('pintrest');
    default:
      return getCachedIcon('default');
  }
}

export function getCustomIcon(name: string) {
  return imageMap[name] || imageMap['default']; // Use 'default' as fallback
}
