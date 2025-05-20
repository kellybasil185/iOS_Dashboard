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

export function getIconForCategory(id: string) {
  switch (id) {
    case 'trading':
      return () => <CustomIcon name="tradingapp" />;
    case 'web':
      return () => <CustomIcon name="web" />;
    case 'entertainment':
      return () => <CustomIcon name="entertainment" />;
    case 'ai':
      return () => <CustomIcon name="ai" />;
    case 'others':
      return () => <CustomIcon name="others" />;
    case 'shopping':
      return () => <CustomIcon name="shopping" />;
    default:
      return () => <CustomIcon name="default" />;
  }
}

export function getIconForApp(id: string) {
  switch (id) {
    case 'tradingview':
      return () => <CustomIcon name="tradingview" />;
    case 'xm':
      return () => <CustomIcon name="xm" />;
    case 'exness':
      return () => <CustomIcon name="exness" />;
    case 'metatrader5':
      return () => <CustomIcon name="mt5" />;
    case 'metatrader4':
      return () => <CustomIcon name="mt4" />;
    case 'forexfactory':
      return () => <CustomIcon name="forex_factory" />;
    case 'myfxbook':
      return () => <CustomIcon name="fxbook" />;
    case 'fundednext':
      return () => <CustomIcon name="fundednext" />;
    case 'google':
      return () => <CustomIcon name="google" />;
    case 'gmail':
      return () => <CustomIcon name="gmail" />;
    case 'icloud':
      return () => <CustomIcon name="icloud" />;
    case 'telegram':
      return () => <CustomIcon name="telegram" />;
    case 'gdrive':
      return () => <CustomIcon name="gdrive" />;
    case 'duckduckgo':
      return () => <CustomIcon name="duckduckgo" />;
    case 'youtube':
      return () => <CustomIcon name="youtube" />;
    case 'tiktok':
      return () => <CustomIcon name="tiktok" />;
    case 'instagram':
      return () => <CustomIcon name="instagram" />;
    case 'spotify':
      return () => <CustomIcon name="spotify" />;
    case 'twitch':
      return () => <CustomIcon name="twitch" />;
    case 'quora':
      return () => <CustomIcon name="quora" />;
    case 'reddit':
      return () => <CustomIcon name="reddit" />;
    case 'chatgpt':
      return () => <CustomIcon name="chatgpt" />;
    case 'gemini':
      return () => <CustomIcon name="gemini" />;
    case 'pornhub':
      return () => <CustomIcon name="pornhub" />;
    case 'jiji':
      return () => <CustomIcon name="jiji" />;
    case 'jumia':
      return () => <CustomIcon name="jumia" />;
    case 'aliexpress':
      return () => <CustomIcon name="aliexpress" />;
    case 'amazon':
      return () => <CustomIcon name="amazon" />;
    default:
      return () => <CustomIcon name="default" />;
  }
}

export function getCustomIcon(name: string) {
  return imageMap[name] || imageMap['default']; // Use 'default' as fallback
}