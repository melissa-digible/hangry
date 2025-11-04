export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string[];
  rating: number;
  price?: string;
  location?: string;
  url?: string;
  photos?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  distance?: number; // Distance in meters
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  summary: string;
  extendedIngredients?: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
}

export type Preference = 'yum' | 'maybe' | 'yuck';

export interface UserPreference {
  restaurantId: string;
  preference: Preference;
  restaurant: Restaurant;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface DistancePreference {
  maxDistance: number; // in meters
  unit: 'miles';
}

export interface FilterPreferences {
  excludedCategories: string[]; // Categories to exclude (e.g., 'Coffee & Tea', 'Fast Food')
  openNow: boolean; // Only show restaurants open now
  priceRange: string[]; // Array of price levels: ['$', '$$', '$$$', '$$$$']
}

