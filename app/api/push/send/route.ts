import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/lib/firebaseAdmin';
import { getWebPush } from '@/lib/webPushServer';
import type { AppNotification } from '@/lib/firebaseOperations';

export const runtime = 'nodejs';

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization');
  return authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
}

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) return Response.json({ error: 'Authentication required.' }, { status: 401 });
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token);
    const body = await request.json() as { notificationId?: unknown };
    if (typeof body.notificationId !== 'string' || body.notificationId.length > 200) {
      return Response.json({ error: 'Invalid notification.' }, { status: 400 });
    }

    const database = getFirebaseAdminFirestore();
    const notificationSnapshot = await database.collection('notifications').doc(body.notificationId).get();
    if (!notificationSnapshot.exists) return Response.json({ error: 'Notification not found.' }, { status: 404 });
    const notification = notificationSnapshot.data() as AppNotification;
    const isAdmin = decodedToken.admin === true;
    if (notification.target !== 'admin' && notification.target !== 'school') {
      return Response.json({ error: 'Invalid notification target.' }, { status: 400 });
    }
    if (notification.target === 'school' && !notification.schoolId) {
      return Response.json({ error: 'Invalid school notification.' }, { status: 400 });
    }

    if (!isAdmin) {
      if (notification.schoolId !== decodedToken.uid) {
        return Response.json({ error: 'Not authorized to send this notification.' }, { status: 403 });
      }
      const schoolSnapshot = await database.collection('schools').doc(decodedToken.uid).get();
      const status = schoolSnapshot.data()?.status;
      if (!schoolSnapshot.exists || !['pending', 'active'].includes(status)) {
        return Response.json({ error: 'An eligible school account is required.' }, { status: 403 });
      }
    }

    const subscriptionsQuery = notification.target === 'admin'
      ? database.collection('pushSubscriptions').where('role', '==', 'admin')
      : database.collection('pushSubscriptions').where('schoolId', '==', notification.schoolId);
    const subscriptions = await subscriptionsQuery.get();
    if (subscriptions.empty) return Response.json({ success: true, sent: 0 });

    const push = getWebPush();
    const payload = JSON.stringify({
      id: notification.id,
      title: notification.title,
      body: notification.message,
      url: notification.target === 'admin' ? '/admin' : '/dashboard',
    });
    let sent = 0;

    await Promise.all(subscriptions.docs.map(async (subscriptionDocument) => {
      const stored = subscriptionDocument.data();
      try {
        await push.sendNotification(stored.subscription, payload);
        sent += 1;
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await subscriptionDocument.ref.delete();
        } else {
          console.warn('[web push delivery failed]', statusCode ?? 'unknown');
        }
      }
    }));

    return Response.json({ success: true, sent });
  } catch (error) {
    console.error('[POST /api/push/send]', error);
    return Response.json({ error: 'Unable to deliver this notification.' }, { status: 500 });
  }
}