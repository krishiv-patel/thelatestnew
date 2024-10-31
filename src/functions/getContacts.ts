import * as functions from 'firebase-functions';
import { google } from 'googleapis';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = getFirestore();

const PEOPLE_API_SCOPE = 'https://www.googleapis.com/auth/contacts.readonly';

export const getContacts = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  // Retrieve user's tokens from Firestore
  const userTokensDoc = await db.collection('users').doc(context.auth.uid).get();
  const userTokens = userTokensDoc.data();

  if (!userTokens || !userTokens.accessToken) {
    throw new functions.https.HttpsError('failed-precondition', 'User tokens not found.');
  }

  // Initialize OAuth2 client
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: userTokens.accessToken,
    refresh_token: userTokens.refreshToken,
    scope: PEOPLE_API_SCOPE,
    token_type: 'Bearer',
    expiry_date: userTokens.expiryDate,
  });

  const peopleService = google.people({ version: 'v1', auth: oauth2Client });

  try {
    const response = await peopleService.people.connections.list({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses,phoneNumbers',
      pageSize: 1000, // Adjust as needed
    });

    return response.data.connections || [];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch contacts.');
  }
});
