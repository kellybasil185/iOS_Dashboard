// ./utils/preloadAssets.ts
import { Asset } from 'expo-asset';
import { imageMap } from '@/components/IconRegistry';

export async function preloadAllIcons(): Promise<void> {
  const modules = Object.values(imageMap) as number[];
  await Promise.all(modules.map(m => Asset.fromModule(m).downloadAsync()));
}
