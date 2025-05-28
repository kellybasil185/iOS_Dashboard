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
        url: 'https://mt5.xmglobal.com/',
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
      {
        id: 'myfxbook',
        name: 'MyFxBook',
        url: 'https://www.myfxbook.com/',
      },
      {
        id: 'fundednext',
        name: 'FundedNext',
        url: 'https://fundednext.com/',
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
      {
        id: 'telegram',
        name: 'Telegram Web',
        url: 'https://web.telegram.org/',
      },
      {
        id: 'gdrive',
        name: 'Google Drive',
        url: 'https://drive.google.com/',
      },
      {
        id: 'duckduckgo',
        name: 'DuckDuckGo',
        url: 'https://duckduckgo.com/',
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
      {
        id: 'spotify',
        name: 'Spotify',
        url: 'https://open.spotify.com/',
      },
      {
        id: 'x',
        name: 'X',
        url: 'https://www.x.com/',
      },
      {
        id: 'twitch',
        name: 'Twitch',
        url: 'https://www.twitch.tv/',
      },
      {
        id: 'quora',
        name: 'Quora',
        url: 'https://www.quora.com/',
      },
      {
        id: 'pintrest',
        name: 'Pintrest',
        url: 'https://www.pintrest.com/',
      },
      {
        id: 'reddit',
        name: 'Reddit',
        url: 'https://www.reddit.com/',
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
    id: 'shopping',
    name: 'Shopping',
    color: '#FF9500',
    apps: [
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
      {
        id: 'aliexpress',
        name: 'AliExpress',
        url: 'https://www.aliexpress.com/',
      },
      {
        id: 'amazon',
        name: 'Amazon',
        url: 'https://www.amazon.com/',
      },
    ],
  },
  {
    id: 'others',
    name: 'Others',
    color: '#8E8E93',
    apps: [
      {
        id: 'pornhub',
        name: 'Pornhub',
        url: 'https://www.pornhub.com/',
      },
      {
        id: 'stripchat',
        name: 'StripChat',
        url: 'https://www.stripchat.com/',
      },
    ],
  },
];

export function getCategory(id: string | undefined): Category | undefined {
  if (!id) return undefined;
  return categories.find((category) => category.id === id);
}