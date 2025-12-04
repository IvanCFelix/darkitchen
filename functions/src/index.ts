import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

/**
 * Cloud Function: onRequestCreated
 * Triggered when a new request is created
 * Schedules automatic expiration after 10 minutes
 */
export const onRequestCreated = functions.firestore
  .document('requests/{requestId}')
  .onCreate(async (snap, context) => {
    const requestId = context.params.requestId;
    const requestData = snap.data();

    try {
      // Schedule expiration (10 minutes)
      const expiresAt = requestData.expiresAt.toDate();
      const now = new Date();
      const delay = expiresAt.getTime() - now.getTime();

      if (delay > 0) {
        // In production, use Cloud Tasks or Pub/Sub for scheduled execution
        // For this implementation, we'll use a simple timeout approach
        // Note: This is demonstration code. In production, use Cloud Scheduler
        setTimeout(async () => {
          const requestRef = db.collection('requests').doc(requestId);
          const requestDoc = await requestRef.get();

          if (requestDoc.exists && requestDoc.data()?.status === 'OPEN') {
            await requestRef.update({
              status: 'EXPIRED'
            });
            console.log(`Request ${requestId} expired automatically`);
          }
        }, delay);
      }

      console.log(`Request ${requestId} created successfully`);
    } catch (error) {
      console.error('Error in onRequestCreated:', error);
    }
  });

/**
 * Cloud Function: expireRequest
 * Manually expires a request (can be called from Cloud Scheduler)
 */
export const expireRequest = functions.https.onCall(async (data, context) => {
  const { requestId } = data;

  if (!requestId) {
    throw new functions.https.HttpsError('invalid-argument', 'requestId is required');
  }

  try {
    const requestRef = db.collection('requests').doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Request not found');
    }

    const requestData = requestDoc.data();
    if (requestData?.status === 'OPEN') {
      await requestRef.update({
        status: 'EXPIRED'
      });
      return { success: true, message: 'Request expired successfully' };
    }

    return { success: false, message: 'Request is not OPEN' };
  } catch (error) {
    console.error('Error in expireRequest:', error);
    throw new functions.https.HttpsError('internal', 'Error expiring request');
  }
});

/**
 * Cloud Function: acceptRequest
 * Accepts a request and creates an order
 */
export const acceptRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { requestId, darkitchenId, dishId, price } = data;
  const userId = context.auth.uid;

  if (!requestId || !darkitchenId || !dishId || !price) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    // Verify darkitchen ownership
    const darkitchenDoc = await db.collection('darkitchens').doc(darkitchenId).get();
    if (!darkitchenDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Darkitchen not found');
    }

    const darkitchenData = darkitchenDoc.data();
    if (darkitchenData?.ownerId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Not the owner of this darkitchen');
    }

    // Verify request exists and is OPEN
    const requestRef = db.collection('requests').doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Request not found');
    }

    const requestData = requestDoc.data();
    if (requestData?.status !== 'OPEN') {
      throw new functions.https.HttpsError('failed-precondition', 'Request is not available');
    }

    // Use transaction to ensure atomicity
    await db.runTransaction(async (transaction) => {
      // Update request status to PRODUCTION (accepted and in production)
      transaction.update(requestRef, {
        status: 'PRODUCTION',
        acceptedByDarkitchenId: darkitchenId,
        acceptedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Create order
      const orderRef = db.collection('orders').doc();
      const order = {
        id: orderRef.id,
        requestId,
        requestTitle: requestData.title || 'Sin título',
        dishId,
        darkitchenId,
        darkitchenOwnerId: userId,
        userId: requestData.userId,
        price,
        deliveryType: requestData.address ? 'DELIVERY' : 'PICKUP',
        status: 'PRODUCTION',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentSimulation: {
          method: requestData.paymentMethod,
          paid: true,
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(7)}`
        }
      };
      transaction.set(orderRef, order);

      // Create initial order status history
      const historyRef = db.collection('orderStatusHistory').doc();
      const historyEntry = {
        id: historyRef.id,
        orderId: orderRef.id,
        status: 'PRODUCTION',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        actorId: userId
      };
      transaction.set(historyRef, historyEntry);
    });

    return { success: true, message: 'Request accepted and order created' };
  } catch (error) {
    console.error('Error in acceptRequest:', error);
    throw new functions.https.HttpsError('internal', 'Error accepting request');
  }
});

/**
 * Cloud Function: onOrderStatusUpdate
 * Triggered when order status is updated
 * Creates history entry and sends notification
 */
export const onOrderStatusUpdate = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const orderId = context.params.orderId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if status changed
    if (beforeData.status === afterData.status) {
      return null;
    }

    try {
      // Create history entry (if not already created by the update function)
      const historyQuery = await db.collection('orderStatusHistory')
        .where('orderId', '==', orderId)
        .where('status', '==', afterData.status)
        .limit(1)
        .get();

      if (historyQuery.empty) {
        const historyRef = db.collection('orderStatusHistory').doc();
        await historyRef.set({
          id: historyRef.id,
          orderId,
          status: afterData.status,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          actorId: afterData.darkitchenOwnerId
        });
      }

      // TODO: Send notification to user
      // This could integrate with FCM (Firebase Cloud Messaging)
      console.log(`Order ${orderId} status changed from ${beforeData.status} to ${afterData.status}`);

      return null;
    } catch (error) {
      console.error('Error in onOrderStatusUpdate:', error);
      return null;
    }
  });
