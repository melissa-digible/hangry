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

