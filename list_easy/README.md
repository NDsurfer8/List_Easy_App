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

## Optional: real AI valuations

By default the app uses **mock** AI (random labels and values). To use OpenAI for real descriptions and valuations:

1. Create a `.env` in `list_easy/` with:

   ```
   EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key-here
   ```

2. Restart Expo. The app will call OpenAI Vision when you draw a box on a frame (and may still fall back to mock if the request fails).

## Project structure

- `app/` – Screens: Home, Upload, Select-frame, Listing detail, Item detail, Offers.
- `context/ListEasyContext.tsx` – Global state (listings, offers) with AsyncStorage persistence.
- `lib/types.ts` – Types for listings, items, offers.
- `lib/ai.ts` – AI valuation (mock + OpenAI-ready).
- `components/FrameSelector.tsx` – Draw selection boxes on a thumbnail image.

Data is stored locally on the device. For multi-user or cloud sync you’d add a backend and auth.
