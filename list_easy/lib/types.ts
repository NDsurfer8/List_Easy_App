export type SelectionBox = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ListedItem = {
  id: string;
  listingId: string;
  /** Crop or frame image URI used for AI */
  imageUri: string;
  /** Bounding box on the frame (for overlay) */
  box: SelectionBox;
  /** AI-generated label */
  label: string;
  /** AI-generated description */
  description: string;
  /** AI-estimated value in dollars */
  estimatedValue: number;
  /** Category for similar items */
  category: string;
  status: 'available' | 'pending' | 'sold';
  createdAt: string;
};

export type RoomListing = {
  id: string;
  videoUri: string;
  /** Thumbnail at selected time for display */
  thumbnailUri: string;
  /** Time in ms used for thumbnail */
  frameTimeMs: number;
  title: string;
  /** Optional location for display (e.g. "Brooklyn, NY") */
  location?: string;
  /** Zip code for search (e.g. "11201") */
  zipCode?: string;
  /** True if videoUri is a video (vs image) so we can show Play video */
  isVideo?: boolean;
  items: ListedItem[];
  createdAt: string;
};

export type Offer = {
  id: string;
  itemId: string;
  listingId: string;
  amount: number;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  pickupScheduledAt?: string;
  createdAt: string;
  buyerName?: string;
};
