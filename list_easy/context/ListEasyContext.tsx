import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RoomListing, ListedItem, Offer } from '../lib/types';

const STORAGE_KEY = '@list_easy_data';

function normalizeZip(zip: string): string {
  const digits = zip.replace(/\D/g, '');
  return digits.length >= 5 ? digits.slice(0, 5) : digits;
}

type ListEasyState = {
  listings: RoomListing[];
  offers: Offer[];
};

type ListEasyContextValue = ListEasyState & {
  addListing: (listing: Omit<RoomListing, 'id' | 'createdAt'>) => string;
  /** Add a listing and all its items in one persist (use this when creating a new listing so it saves correctly). */
  addListingWithItems: (
    listing: Omit<RoomListing, 'id' | 'createdAt' | 'items'>,
    items: Omit<ListedItem, 'id' | 'listingId' | 'createdAt' | 'status'>[]
  ) => string;
  updateListing: (id: string, patch: Partial<RoomListing>) => void;
  addItem: (listingId: string, item: Omit<ListedItem, 'id' | 'listingId' | 'createdAt' | 'status'>) => string;
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt' | 'status'>) => string;
  acceptOffer: (offerId: string, pickupScheduledAt?: string) => void;
  declineOffer: (offerId: string) => void;
  getOffersForItem: (itemId: string) => Offer[];
  getListing: (id: string) => RoomListing | undefined;
  getItem: (id: string) => ListedItem | undefined;
  getSimilarItems: (category: string, excludeItemId: string) => ListedItem[];
  getZipCodes: () => string[];
  getListingsByZipCode: (zipCode: string | null) => RoomListing[];
};

const defaultState: ListEasyState = { listings: [], offers: [] };

const ListEasyContext = createContext<ListEasyContextValue | null>(null);

export function ListEasyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ListEasyState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as { listings?: RoomListing[]; offers?: Offer[] };
            setState({
              listings: parsed.listings ?? [],
              offers: (parsed.offers ?? []) as Offer[],
            });
          } catch (_) {}
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const persist = useCallback((next: ListEasyState) => {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addListing = useCallback(
    (listing: Omit<RoomListing, 'id' | 'createdAt'>): string => {
      const id = `listing_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const now = new Date().toISOString();
      const newListing: RoomListing = {
        ...listing,
        id,
        createdAt: now,
      };
      const next = {
        ...state,
        listings: [...state.listings, newListing],
      };
      persist(next);
      return id;
    },
    [state, persist]
  );

  const addListingWithItems = useCallback(
    (
      listing: Omit<RoomListing, 'id' | 'createdAt' | 'items'>,
      items: Omit<ListedItem, 'id' | 'listingId' | 'createdAt' | 'status'>[]
    ): string => {
      const listingId = `listing_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const now = new Date().toISOString();
      const listedItems: ListedItem[] = items.map((item, i) => ({
        ...item,
        id: `item_${listingId}_${i}_${Math.random().toString(36).slice(2, 7)}`,
        listingId,
        status: 'available' as const,
        createdAt: now,
      }));
      const newListing: RoomListing = {
        ...listing,
        id: listingId,
        createdAt: now,
        items: listedItems,
      };
      const next = {
        ...state,
        listings: [...state.listings, newListing],
      };
      persist(next);
      return listingId;
    },
    [state, persist]
  );

  const updateListing = useCallback(
    (id: string, patch: Partial<RoomListing>) => {
      const next = {
        ...state,
        listings: state.listings.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      };
      persist(next);
    },
    [state, persist]
  );

  const addItem = useCallback(
    (listingId: string, item: Omit<ListedItem, 'id' | 'listingId' | 'createdAt' | 'status'>): string => {
      const id = `item_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const now = new Date().toISOString();
      const newItem: ListedItem = {
        ...item,
        id,
        listingId,
        status: 'available',
        createdAt: now,
      };
      const next = {
        ...state,
        listings: state.listings.map((l) =>
          l.id === listingId ? { ...l, items: [...l.items, newItem] } : l
        ),
      };
      persist(next);
      return id;
    },
    [state, persist]
  );

  const addOffer = useCallback(
    (offer: Omit<Offer, 'id' | 'createdAt' | 'status'>): string => {
      const id = `offer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const now = new Date().toISOString();
      const newOffer: Offer = { ...offer, id, status: 'pending', createdAt: now };
      const next = { ...state, offers: [...state.offers, newOffer] };
      persist(next);
      return id;
    },
    [state, persist]
  );

  const acceptOffer = useCallback(
    (offerId: string, pickupScheduledAt?: string) => {
      const offer = state.offers.find((o) => o.id === offerId);
      if (!offer) return;
      const nextOffers = state.offers.map((o) =>
        o.id === offerId
          ? { ...o, status: 'accepted' as const, pickupScheduledAt }
          : o.itemId === offer.itemId && o.id !== offerId
            ? { ...o, status: 'declined' as const }
            : o
      );
      const nextListings = state.listings.map((l) => ({
        ...l,
        items: l.items.map((i) =>
          i.id === offer.itemId ? { ...i, status: 'pending' as const } : i
        ),
      }));
      persist({ ...state, offers: nextOffers, listings: nextListings });
    },
    [state, persist]
  );

  const declineOffer = useCallback(
    (offerId: string) => {
      const next: ListEasyState = {
        ...state,
        offers: state.offers.map((o) =>
          o.id === offerId ? { ...o, status: 'declined' as const } : o
        ),
      };
      persist(next);
    },
    [state, persist]
  );

  const getOffersForItem = useCallback(
    (itemId: string) => state.offers.filter((o) => o.itemId === itemId),
    [state.offers]
  );

  const getListing = useCallback((id: string) => state.listings.find((l) => l.id === id), [state.listings]);
  const getItem = useCallback(
    (id: string) => state.listings.flatMap((l) => l.items).find((i) => i.id === id),
    [state.listings]
  );

  const getSimilarItems = useCallback(
    (category: string, excludeItemId: string): ListedItem[] => {
      return state.listings
        .flatMap((l) => l.items)
        .filter((i) => i.category === category && i.id !== excludeItemId && i.status === 'available')
        .slice(0, 6);
    },
    [state.listings]
  );

  const getZipCodes = useCallback((): string[] => {
    const set = new Set<string>();
    state.listings.forEach((l) => {
      const zip = normalizeZip((l.zipCode ?? '').trim());
      if (zip) set.add(zip);
    });
    return Array.from(set).sort();
  }, [state.listings]);

  const getListingsByZipCode = useCallback(
    (zipCode: string | null): RoomListing[] => {
      if (!zipCode || zipCode.trim() === '') return state.listings;
      const normalized = normalizeZip(zipCode.trim());
      if (!normalized) return state.listings;
      return state.listings.filter((l) => normalizeZip((l.zipCode ?? '').trim()) === normalized);
    },
    [state.listings]
  );

  const value = useMemo<ListEasyContextValue>(
    () => ({
      ...state,
      addListing,
      addListingWithItems,
      updateListing,
      addItem,
      addOffer,
      acceptOffer,
      declineOffer,
      getOffersForItem,
      getListing,
      getItem,
      getSimilarItems,
      getZipCodes,
      getListingsByZipCode,
    }),
    [
      state,
      addListing,
      addListingWithItems,
      updateListing,
      addItem,
      addOffer,
      acceptOffer,
      declineOffer,
      getOffersForItem,
      getListing,
      getItem,
      getSimilarItems,
      getZipCodes,
      getListingsByZipCode,
    ]
  );

  if (!loaded) return null;
  return <ListEasyContext.Provider value={value}>{children}</ListEasyContext.Provider>;
}

export function useListEasy() {
  const ctx = useContext(ListEasyContext);
  if (!ctx) throw new Error('useListEasy must be used within ListEasyProvider');
  return ctx;
}
