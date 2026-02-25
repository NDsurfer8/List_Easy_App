# List Easy

App where you upload a video of a room, select items on a frame (draw boxes), get AI-estimated values, and let buyers make offers and arrange pickup. Includes similar-items suggestions by category.

## Features

- **Upload room video** – Pick a video from your library.
- **Select items** – Pick a frame (time in seconds), then draw boxes around furniture/items. Each selection gets an AI label and estimated value.
- **Listings** – Save a listing with a title; all selected items appear with their values.
- **Item detail** – View AI value, description, category; make an offer with amount and message.
- **Offers & pickups** – Sellers see pending offers, accept/decline, and track accepted pickups.
- **Similar items** – Each item shows its category and links to other listed items in the same category.

## Get started

1. Install dependencies:

   ```bash
   cd list_easy && npm install
   ```

2. Start the app:

   ```bash
   npx expo start
   ```

3. Open in [Expo Go](https://expo.dev/go), iOS simulator, or Android emulator.

## Environment (optional)

Copy `.env.example` to `.env` in `list_easy/` and fill in any values you need. Restart Expo after changing `.env`.

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_OPENAI_API_KEY` | Use OpenAI Vision for real item labels and valuations. Omit for mock AI. |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Required for Firebase (with project ID and storage bucket). |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID. |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket (e.g. `yourapp.appspot.com`). |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Optional; set if using Firebase Auth. |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Optional; for FCM. |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Optional; from Firebase Console. |

- **OpenAI:** When the key is set, the app sends frame images (as base64) to the Vision API when you draw a box; it falls back to mock if the request fails.
- **Firebase:** When API key, project ID, and storage bucket are set, listings and offers sync to Firestore and listing thumbnails are uploaded to Storage. Otherwise the app uses local AsyncStorage only.

### Firestore security rules

If you use Firestore but nothing appears or you see permission errors, set Firestore rules so the app can read/write. In [Firebase Console](https://console.firebase.google.com) → your project → **Firestore Database** → **Rules**, use for development:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /listings/{id} { allow read, write: if true; }
    match /offers/{id} { allow read, write: if true; }
  }
}
```

For production you should restrict `if true` to authenticated users (e.g. `if request.auth != null`).

## Project structure

- `app/` – Screens: Home, Upload, Select-frame, Listing detail, Item detail, Offers.
- `context/ListEasyContext.tsx` – Global state (listings, offers); Firestore when configured, else AsyncStorage.
- `lib/types.ts` – Types for listings, items, offers.
- `lib/ai.ts` – AI valuation (mock + OpenAI Vision with base64 images).
- `lib/firebase.ts` – Firestore + Storage helpers; thumbnail upload.
- `components/FrameSelector.tsx` – Draw selection boxes on a thumbnail image.
