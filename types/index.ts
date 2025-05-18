export interface App {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  apps: App[];
}