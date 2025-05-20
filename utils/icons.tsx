import React from 'react';
import { 
  ChartBar as BarChart, 
  Chrome, 
  Mail, 
  Cloud, 
  Youtube, 
  GitBranch as BrandTiktok, 
  Instagram, 
  MessageSquareText, 
  Sparkles, 
  Globe, 
  Store, 
  ShoppingBag, 
  Settings, 
  Video, 
  Wallet, 
  ChartLine as LineChart, 
  ChartArea as AreaChart, 
  ChartCandlestick as CandlestickChart,
  Music,
  MessageCircle,
  Search,
  FileText,
  Send,
  Folder,
  Bird as Twitter,
  MessagesSquare,
  ShoppingCart,
  Package
} from 'lucide-react-native';

export function getIconForCategory(id: string) {
  switch (id) {
    case 'trading':
      return BarChart;
    case 'web':
      return Globe;
    case 'entertainment':
      return Video;
    case 'ai':
      return Sparkles;
    case 'others':
      return Settings;
    default:
      return Globe;
  }
}

export function getIconForApp(id: string) {
  switch (id) {
    case 'tradingview':
      return CandlestickChart;
    case 'xm':
      return Wallet;
    case 'exness':
      return Wallet;
    case 'metatrader5':
      return LineChart;
    case 'metatrader4':
      return AreaChart;
    case 'forexfactory':
      return BarChart;
    case 'myfxbook':
      return LineChart;
    case 'fundednext':
      return Wallet;
    case 'google':
      return Chrome;
    case 'gmail':
      return Mail;
    case 'icloud':
      return Cloud;
    case 'telegram':
      return Send;
    case 'gdrive':
      return Folder;
    case 'duckduckgo':
      return Search;
    case 'youtube':
      return Youtube;
    case 'tiktok':
      return BrandTiktok;
    case 'instagram':
      return Instagram;
    case 'spotify':
      return Music;
    case 'twitch':
      return Video;
    case 'quora':
      return MessageCircle;
    case 'reddit':
      return MessagesSquare;
    case 'chatgpt':
      return MessageSquareText;
    case 'gemini':
      return Sparkles;
    case 'pornhub':
      return Video;
    case 'jiji':
      return Store;
    case 'jumia':
      return ShoppingBag;
    case 'aliexpress':
      return ShoppingCart;
    case 'amazon':
      return Package;
    default:
      return Globe;
  }
}