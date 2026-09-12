export {};

interface TelegramWebApp {
  initData: string;
  ready: () => void;
  expand: () => void;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}
