import { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'trading',
    name: 'Trading Apps',
    color: '#30B0C7',
    apps: [
      {
        id: 'tradingview',
        name: 'TradingView',
        url: 'https://www.tradingview.com/',
      },
      {
        id: 'xm',
        name: 'XM',
        url: 'https://www.xm.com/',
      },
      {
        id: 'exness',
        name: 'Exness',
        url: 'https://www.exness.com/',
      },
      {
        id: 'metatrader5',
        name: 'MetaTrader 5',
        url: 'https://www.metatrader5.com/',
      },
      {
        id: 'metatrader4',
        name: 'MetaTrader 4',
        url: 'https://www.metatrader4.com/',
      },
      {
        id: 'forexfactory',
        name: 'Forex Factory',
        url: 'https://www.forexfactory.com/',
      },
    ],
  },
  {
    id: 'web',
    name: 'Web Utilities',
    color: '#007AFF',
    apps: [
      {
        id: 'google',
        name: 'Google',
        url: 'https://www.google.com/',
      },
      {
        id: 'gmail',
        name: 'Gmail',
        url: 'https://mail.google.com/',
      },
      {
        id: 'icloud',
        name: 'iCloud',
        url: 'https://www.icloud.com/',
      },
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    color: '#FF2D55',
    apps: [
      {
        id: 'youtube',
        name: 'YouTube',
        url: 'https://www.youtube.com/',
      },
      {
        id: 'tiktok',
        name: 'TikTok',
        url: 'https://www.tiktok.com/',
      },
      {
        id: 'instagram',
        name: 'Instagram',
        url: 'https://www.instagram.com/',
      },
    ],
  },
  {
    id: 'ai',
    name: 'AI',
    color: '#5856D6',
    apps: [
      {
        id: 'chatgpt',
        name: 'ChatGPT',
        url: 'https://chat.openai.com/',
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        url: 'https://gemini.google.com/',
      },
    ],
  },
  {
    id: 'others',
    name: 'Others',
    color: '#FF9500',
    apps: [
      {
        id: 'pornhub',
        name: 'Pornhub',
        url: 'https://www.pornhub.com/',
      },
      {
        id: 'jiji',
        name: 'Jiji Ghana',
        url: 'https://jiji.com.gh/',
      },
      {
        id: 'jumia',
        name: 'Jumia',
        url: 'https://www.jumia.com.gh/',
      },
    ],
  },
];

export function getCategory(id: string | undefined): Category | undefined {
  if (!id) return undefined;
  return categories.find((category) => category.id === id);
}