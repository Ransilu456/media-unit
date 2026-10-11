import { createHash } from 'node:crypto';
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/lib/firebaseAdmin';

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
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const isAdmin = Boolean(adminEmail) && decodedToken.email?.trim().toLowerCase() === adminEmail;
    const body = await request.json() as {
      endpoint?: unknown;
      expirationTime?: unknown;
      keys?: { p256dh?: unknown; auth?: unknown };
    };

    if (
      typeof body.endpoint !== 'string' ||
      !body.endpoint.startsWith('https://') ||
      typeof body.keys?.p256dh !== 'string' ||
      !body.keys.p256dh ||
      typeof body.keys.auth !== 'string' ||
      !body.keys.auth
    ) {
      return Response.json({ error: 'Invalid push subscription.' }, { status: 400 });
    }
    let endpointHost: string;
    try {
      endpointHost = new URL(body.endpoint).hostname;
    } catch {
      return Response.json({ error: 'Invalid push subscription endpoint.' }, { status: 400 });
    }
    const allowedPushHost = endpointHost === 'fcm.googleapis.com'
      || endpointHost === 'web.push.apple.com'
      || endpointHost === 'push.services.mozilla.com'
      || endpointHost.endsWith('.push.services.mozilla.com')
      || endpointHost.endsWith('.notify.windows.com');
    if (!allowedPushHost) {
      return Response.json({ error: 'Unsupported push service endpoint.' }, { status: 400 });
    }

    const database = getFirebaseAdminFirestore();
    const role = isAdmin ? 'admin' : 'school';
    if (!isAdmin) {
      const schoolSnapshot = await database.collection('schools').doc(decodedToken.uid).get();
      const status = schoolSnapshot.data()?.status;
      if (!schoolSnapshot.exists || !['pending', 'active'].includes(status)) {
        return Response.json({ error: 'An eligible school account is required.' }, { status: 403 });
      }
    }

    const subscriptionId = createHash('sha256').update(body.endpoint).digest('hex');
    await database.collection('pushSubscriptions').doc(subscriptionId).set({
      ownerUid: decodedToken.uid,
      role,
      ...(isAdmin ? {} : { schoolId: decodedToken.uid }),
      subscription: {
        endpoint: body.endpoint,
        expirationTime: typeof body.expirationTime === 'number' ? body.expirationTime : null,
        keys: { p256dh: body.keys.p256dh, auth: body.keys.auth },
      },
      updatedAt: Date.now(),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('[POST /api/push/subscriptions]', error);
    return Response.json({ error: 'Unable to save this notification device.' }, { status: 500 });
  }
}