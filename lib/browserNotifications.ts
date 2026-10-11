'use client';

import { auth } from './firebase';

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

async function savePushSubscription(subscription: PushSubscription): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in before enabling device notifications.');
  const idToken = await user.getIdToken();
  const response = await fetch('/api/push/subscriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!response.ok) throw new Error('The notification device could not be registered.');
}

export async function syncExistingDeviceNotifications(): Promise<DeviceNotificationPermission> {
  const permission = getDeviceNotificationStatus();
  if (permission !== 'granted') return permission;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported';
  try {
    const serviceWorker = await registerServiceWorker();
    const subscription = await serviceWorker?.pushManager.getSubscription();
    if (!subscription) return 'default';
    await savePushSubscription(subscription);
    return 'granted';
  } catch (err) {
    console.warn('[notification subscription sync error]', err);
    return 'default';
  }
}

export async function requestDeviceNotificationPermission(): Promise<DeviceNotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return permission;

    const user = auth.currentUser;
    if (!user) throw new Error('Sign in before enabling device notifications.');

    const serviceWorker = await registerServiceWorker();
    if (!serviceWorker?.pushManager) throw new Error('Push notifications are not supported by this browser.');

    const keyResponse = await fetch('/api/push/key');
    if (!keyResponse.ok) throw new Error('Push notifications are not configured for this site.');
    const { publicKey } = await keyResponse.json() as { publicKey: string };
    const applicationServerKey = decodeApplicationServerKey(publicKey);
    const subscription = await serviceWorker.pushManager.getSubscription()
      ?? await serviceWorker.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
    await savePushSubscription(subscription);
    return 'granted';
  } catch (err) {
    console.warn('[notification permission error]', err);
    return Notification.permission === 'granted' ? 'default' : 'denied';
  }
}

function decodeApplicationServerKey(value: string): Uint8Array<ArrayBuffer> {
  const paddedValue = value.padEnd(Math.ceil(value.length / 4) * 4, '=');
  const base64Value = paddedValue.replace(/-/g, '+').replace(/_/g, '/');
  const rawValue = window.atob(base64Value);
  const bytes = new Uint8Array(rawValue.length);
  for (let index = 0; index < rawValue.length; index += 1) {
    bytes[index] = rawValue.charCodeAt(index);
  }
  return bytes;
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
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, notificationOptions);
        return true;
      }
    }

    // Desktop Web Notification API
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
