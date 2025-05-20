import React from 'react';
import CustomIcon from '@/components/CustomIcon';

const imageMap: { [key: string]: any } = {
  'ai': require('@/assets/icons/ai.png'),
  'aliexpress': require('@/assets/icons/aliexpress.png'),
  'amazon': require('@/assets/icons/amazon.png'),
  'chatgpt': require('@/assets/icons/chatgpt.png'),
  'default': require('@/assets/icons/default.png'),
  'jiji': require('@/assets/icons/jiji.png'),
  'jumia': require('@/assets/icons/jumia.png'),
  'youtube': require('@/assets/icons/youtube.png'),
  'mt4': require('@/assets/icons/mt4.png'),
  'mt5': require('@/assets/icons/mt5.png'),
  'others': require('@/assets/icons/others.png'),
  'pornhub': require('@/assets/icons/pornhub.png'),
  'duckduckgo': require('@/assets/icons/duckduckgo.png'),
  'entertainment': require('@/assets/icons/entertainment.png'),
  'exness': require('@/assets/icons/exness.png'),
  'forex_factory': require('@/assets/icons/forex_factory.png'),
  'fundednext': require('@/assets/icons/fundednext.png'),
  'fxbook': require('@/assets/icons/fxbook.png'),
  'gdrive': require('@/assets/icons/gdrive.png'),
  'gemini': require('@/assets/icons/gemini.png'),
  'gmail': require('@/assets/icons/gmail.png'),
  'google': require('@/assets/icons/google.png'),
  'icloud': require('@/assets/icons/icloud.png'),
  'instagram': require('@/assets/icons/instagram.png'),
  'quora': require('@/assets/icons/quora.png'),
  'reddit': require('@/assets/icons/reddit.png'),
  'shopping': require('@/assets/icons/shopping.png'),
  'spotify': require('@/assets/icons/spotify.png'),
  'telegram': require('@/assets/icons/telegram.png'),
  'tiktok': require('@/assets/icons/tiktok.png'),
  'tradingapp': require('@/assets/icons/tradingapp.png'),
  'tradingview': require('@/assets/icons/tradingview.png'),
  'twitch': require('@/assets/icons/twitch.png'),
  'web': require('@/assets/icons/web.png'),
  'xm': require('@/assets/icons/xm.png'),
};

const iconCache: { [key: string]: React.FC } = {};

function getCachedIcon(name: string): React.FC {
  if (iconCache[name]) {
    return iconCache[name];
  }

  const iconComponent = () => <CustomIcon name={name} />;
  iconCache[name] = iconComponent;
  return iconComponent;
}

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
    default:
      return getCachedIcon('default');
  }
}

export function getCustomIcon(name: string) {
  return imageMap[name] || imageMap['default']; // Use 'default' as fallback
}
