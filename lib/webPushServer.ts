import 'server-only';
import webPush from 'web-push';

export function getWebPush() {
  const publicKey = process.env.WEB_PUSH_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY;
  const contactEmail = process.env.WEB_PUSH_CONTACT_EMAIL;
  if (!publicKey || !privateKey || !contactEmail) {
    throw new Error('Web Push VAPID settings are not configured.');
  }

  webPush.setVapidDetails(`mailto:${contactEmail}`, publicKey, privateKey);
  return webPush;
}