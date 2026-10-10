'use client';

export type DeviceNotificationPermission = 'granted' | 'denied' | 'default' | 'unsupported';

export function getDeviceNotificationStatus(): DeviceNotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return registration;
  } catch (err) {
    console.warn('[service-worker registration failed]', err);
    return null;
  }
}

export async function requestDeviceNotificationPermission(): Promise<DeviceNotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    // Also warm up service worker registration
    void registerServiceWorker();
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('[notification permission error]', err);
    return 'denied';
  }
}

export interface DeviceNotificationOptions {
  body?: string;
  tag?: string;
  icon?: string;
  badge?: string;
  url?: string;
}

export async function sendDeviceNotification(
  title: string,
  options: DeviceNotificationOptions = {}
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const notificationOptions = {
    body: options.body || 'New update from Agradhi Media Unit',
    icon: options.icon || '/Agradhi.png',
    badge: options.badge || '/icons/icon-192.png',
    tag: options.tag || `agradhi_${Date.now()}`,
    vibrate: [200, 100, 200],
    data: {
      url: options.url || window.location.pathname || '/dashboard',
    },
  };

  try {
    // Preferred: Service Worker showNotification (works on Mobile Chrome / Android PWA and backgrounded tabs)
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, notificationOptions);
        return true;
      }
    }

    // Fallback: Desktop Web Notification API
    const notification = new Notification(title, notificationOptions);
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.url) {
        window.location.href = options.url;
      }
    };
    return true;
  } catch (err) {
    console.warn('[send device notification error]', err);
    return false;
  }
}
