/**
 * Firebase (Firestore + Storage) for List Easy.
 * Set EXPO_PUBLIC_FIREBASE_* in .env to enable; otherwise the app uses local AsyncStorage.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { File } from 'expo-file-system';
import type { RoomListing, ListedItem, Offer } from './types';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.storageBucket);
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0] as FirebaseApp;
    }
  }
  return app;
}

export function getDb(): Firestore | null {
  if (!getFirebaseApp()) return null;
  if (!db) db = getFirestore(app!);
  return db;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  if (!getFirebaseApp()) return null;
  if (!storage) storage = getStorage(app!);
  return storage;
}

const MAX_IMAGE_BASE64_MB = 8;

/** Read local file as base64 (for images). Returns null if too large or error. */
export async function readFileAsBase64(uri: string): Promise<string | null> {
  try {
    if (!uri || (!uri.startsWith('file://') && !uri.startsWith('file:'))) {
      return uri.startsWith('data:') ? uri.split(',')[1] ?? null : null;
    }
    const file = new File(uri);
    if (!file.exists || file.size > MAX_IMAGE_BASE64_MB * 1024 * 1024) return null;
    return await file.base64();
  } catch {
    return null;
  }
}

/** Upload a local image (base64) to Firebase Storage; returns download URL. */
export async function uploadImageToStorage(path: string, localUri: string): Promise<string | null> {
  const st = getFirebaseStorage();
  if (!st) return null;
  const base64 = await readFileAsBase64(localUri);
  if (!base64) return null;
  try {
    const storageRef = ref(st, path);
    await uploadString(storageRef, base64, 'base64', { contentType: 'image/jpeg' });
    return await getDownloadURL(storageRef);
  } catch (e) {
    console.warn('Firebase Storage upload failed:', e);
    return null;
  }
}

/** Upload listing thumbnail to Storage. Video stays local (or add server upload later). */
export async function uploadListingThumbnail(
  listingId: string,
  thumbnailUri: string
): Promise<string | null> {
  return uploadImageToStorage(`listings/${listingId}/thumb.jpg`, thumbnailUri);
}

// --- Firestore ---

const LISTINGS_COLLECTION = 'listings';
const OFFERS_COLLECTION = 'offers';

/** Subscribe to all listings; returns unsubscribe. */
export function subscribeListings(cb: (listings: RoomListing[]) => void): Unsubscribe {
  const database = getDb();
  if (!database) {
    cb([]);
    return () => {};
  }
  const col = collection(database, LISTINGS_COLLECTION);
  return onSnapshot(
    col,
    (snap) => {
      const listings: RoomListing[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as RoomListing));
      cb(listings);
    },
    (err) => {
      console.warn('[Firestore] Listings subscription error:', err?.message ?? err);
    }
  );
}

/** Subscribe to all offers; returns unsubscribe. */
export function subscribeOffers(cb: (offers: Offer[]) => void): Unsubscribe {
  const database = getDb();
  if (!database) {
    cb([]);
    return () => {};
  }
  const col = collection(database, OFFERS_COLLECTION);
  return onSnapshot(
    col,
    (snap) => {
      const offers: Offer[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Offer));
      cb(offers);
    },
    (err) => {
      console.warn('[Firestore] Offers subscription error:', err?.message ?? err);
    }
  );
}

/** Create or overwrite a listing (with items) in Firestore. */
export async function firestoreSetListing(listing: RoomListing): Promise<void> {
  const database = getDb();
  if (!database) return;
  const ref = doc(database, LISTINGS_COLLECTION, listing.id);
  await setDoc(ref, listing);
}

/** Update a listing with a partial object. */
export async function firestoreUpdateListing(listingId: string, patch: Partial<RoomListing>): Promise<void> {
  const database = getDb();
  if (!database) return;
  const ref = doc(database, LISTINGS_COLLECTION, listingId);
  await updateDoc(ref, patch as Record<string, unknown>);
}

/** Delete a listing from Firestore. */
export async function firestoreDeleteListing(listingId: string): Promise<void> {
  const database = getDb();
  if (!database) return;
  const ref = doc(database, LISTINGS_COLLECTION, listingId);
  await deleteDoc(ref);
}

/** Update one item inside a listing (replace full items array). */
export async function firestoreUpdateListingItems(listingId: string, items: ListedItem[]): Promise<void> {
  const database = getDb();
  if (!database) return;
  const ref = doc(database, LISTINGS_COLLECTION, listingId);
  await updateDoc(ref, { items });
}

/** Create an offer in Firestore. */
export async function firestoreSetOffer(offer: Offer): Promise<void> {
  const database = getDb();
  if (!database) return;
  const ref = doc(database, OFFERS_COLLECTION, offer.id);
  await setDoc(ref, offer);
}

/** Update an offer (e.g. accept/decline). */
export async function firestoreUpdateOffer(offerId: string, patch: Partial<Offer>): Promise<void> {
  const database = getDb();
  if (!database) return;
  const ref = doc(database, OFFERS_COLLECTION, offerId);
  await updateDoc(ref, patch as Record<string, unknown>);
}

/** Delete an offer from Firestore. */
export async function firestoreDeleteOffer(offerId: string): Promise<void> {
  const database = getDb();
  if (!database) return;
  const ref = doc(database, OFFERS_COLLECTION, offerId);
  await deleteDoc(ref);
}
