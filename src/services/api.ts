import axios from 'axios';
import { Restaurant, Recipe, LocationData, DistancePreference, UserPreference } from '../types';

// Yelp Fusion API Configuration
// Note: In production, these should be stored in environment variables
const YELP_API_KEY = import.meta.env.VITE_YELP_API_KEY || '';
const YELP_BASE_URL = 'https://api.yelp.com/v3';

// Spoonacular Recipe API Configuration
const SPOONACULAR_API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || '';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

// Unsplash API for food images
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';

// Mock data for development (when API keys are not available)
const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'The Italian Bistro',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    cuisine: ['Italian', 'Pasta'],
    rating: 4.5,
    price: '$$',
    location: 'Downtown',
    photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800']
  },
  {
    id: '2',
    name: 'Sushi Master',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
    cuisine: ['Japanese', 'Sushi'],
    rating: 4.8,
    price: '$$$',
    location: 'Midtown',
    photos: ['https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800']
  },
  {
    id: '3',
    name: 'Burger Palace',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    cuisine: ['American', 'Burgers'],
    rating: 4.3,
    price: '$',
    location: 'Uptown',
    photos: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800']
  },
  {
    id: '4',
    name: 'Taco Fiesta',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    cuisine: ['Mexican', 'Tacos'],
    rating: 4.6,
    price: '$',
    location: 'East Side',
    photos: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800']
  },
  {
    id: '5',
    name: 'Pizza Corner',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    cuisine: ['Italian', 'Pizza'],
    rating: 4.4,
    price: '$$',
    location: 'West End',
    photos: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800']
  },
  {
    id: '6',
    name: 'Thai Garden',
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
    cuisine: ['Thai', 'Asian'],
    rating: 4.7,
    price: '$$',
    location: 'South District',
    photos: ['https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800']
  },
  {
    id: '7',
    name: 'BBQ Smokehouse',
    image: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800',
    cuisine: ['American', 'BBQ'],
    rating: 4.5,
    price: '$$',
    location: 'North Quarter',
    photos: ['https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800']
  },
  {
    id: '8',
    name: 'Ramen House',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    cuisine: ['Japanese', 'Ramen'],
    rating: 4.6,
    price: '$$',
    location: 'Central',
    photos: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800']
  },
];

// Helper function to get food image from Unsplash based on cuisine
async function getFoodImage(cuisineTypes: string[], restaurantName: string): Promise<string> {
  // Try to get a food image from Unsplash based on cuisine
  if (UNSPLASH_ACCESS_KEY) {
    try {
      // Use the first cuisine type as search term
      const searchTerm = cuisineTypes[0] || restaurantName.split(' ')[0];
      const response = await axios.get(`${UNSPLASH_BASE_URL}/search/photos`, {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
        params: {
          query: `${searchTerm} food`,
          orientation: 'portrait',
          per_page: 1,
        },
      });
      
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].urls.regular;
      }
    } catch (error) {
      console.error('Error fetching from Unsplash:', error);
    }
  }
  
  // Fallback: Use curated food images based on cuisine type
  const cuisine = cuisineTypes[0]?.toLowerCase() || 'food';
  const foodImages: Record<string, string> = {
    'italian': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    'pasta': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    'japanese': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
    'sushi': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
    'ramen': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    'american': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    'bbq': 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800',
    'mexican': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    'taco': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    'thai': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
    'asian': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
    'chinese': 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800',
    'indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
    'seafood': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
    'mediterranean': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    'french': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    'greek': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  };
  
  for (const cuisineType of cuisineTypes) {
    const lowerCuisine = cuisineType.toLowerCase();
    if (foodImages[lowerCuisine]) {
      return foodImages[lowerCuisine];
    }
  }
  
  // Default food image
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800';
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Analyze preferences to extract yum/yuck patterns
function analyzePreferences(preferences: UserPreference[]): {
  likedCuisines: Set<string>;
  dislikedCuisines: Set<string>;
  cuisineScores: Map<string, number>;
} {
  const likedCuisines = new Set<string>();
  const dislikedCuisines = new Set<string>();
  const cuisineScores = new Map<string, number>();

  preferences.forEach(pref => {
    pref.restaurant.cuisine.forEach(cuisine => {
      const lowerCuisine = cuisine.toLowerCase();
      if (pref.preference === 'yum') {
        likedCuisines.add(lowerCuisine);
        cuisineScores.set(lowerCuisine, (cuisineScores.get(lowerCuisine) || 0) + 2);
      } else if (pref.preference === 'yuck') {
        dislikedCuisines.add(lowerCuisine);
        cuisineScores.set(lowerCuisine, (cuisineScores.get(lowerCuisine) || 0) - 3);
      } else {
        cuisineScores.set(lowerCuisine, (cuisineScores.get(lowerCuisine) || 0) - 0.5);
      }
    });
  });

  return { likedCuisines, dislikedCuisines, cuisineScores };
}

export class RestaurantService {
  private static instance: RestaurantService;
  private restaurants: Restaurant[] = [];
  private currentIndex = 0;

  static getInstance(): RestaurantService {
    if (!RestaurantService.instance) {
      RestaurantService.instance = new RestaurantService();
    }
    return RestaurantService.instance;
  }

  async fetchRestaurants(
    location?: LocationData,
    locationString: string = 'San Francisco',
    limit: number = 50,
    maxDistance?: number
  ): Promise<Restaurant[]> {
    // If Yelp API key is available, use real API
    if (YELP_API_KEY) {
      try {
        const params: any = {
          term: 'restaurants',
          limit,
          sort_by: 'rating',
        };

        // Use coordinates if available, otherwise use location string
        if (location) {
          params.latitude = location.latitude;
          params.longitude = location.longitude;
          if (maxDistance) {
            params.radius = maxDistance; // Yelp uses meters
          }
        } else {
          params.location = locationString;
        }

        const response = await axios.get(`${YELP_BASE_URL}/businesses/search`, {
          headers: {
            'Authorization': `Bearer ${YELP_API_KEY}`,
          },
          params,
        });

        // Process restaurants and get food images
        const restaurantsWithFoodImages = await Promise.all(
          response.data.businesses.map(async (business: any) => {
            const cuisineTypes = business.categories?.map((cat: any) => cat.title) || [];
            const foodImage = await getFoodImage(cuisineTypes, business.name);
            
            const restaurant: Restaurant = {
              id: business.id,
              name: business.name,
              image: foodImage,
              cuisine: cuisineTypes,
              rating: business.rating,
              price: business.price,
              location: business.location?.display_address?.join(', ') || '',
              url: business.url,
              photos: [foodImage],
            };

            // Add coordinates and distance if location is available
            if (location && business.coordinates) {
              restaurant.coordinates = {
                latitude: business.coordinates.latitude,
                longitude: business.coordinates.longitude,
              };
              restaurant.distance = calculateDistance(
                location.latitude,
                location.longitude,
                business.coordinates.latitude,
                business.coordinates.longitude
              );
            }

            return restaurant;
          })
        );

        // Filter by distance if maxDistance is specified
        let filtered = restaurantsWithFoodImages;
        if (location && maxDistance) {
          filtered = restaurantsWithFoodImages.filter(r => 
            r.distance !== undefined && r.distance <= maxDistance
          );
        }

        // Sort by distance if available
        filtered.sort((a, b) => {
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          return (b.rating || 0) - (a.rating || 0);
        });

        this.restaurants = filtered;
        return this.restaurants;
      } catch (error) {
        console.error('Error fetching from Yelp API:', error);
        // Fall back to mock data with coordinates
        this.restaurants = this.addMockCoordinates([...MOCK_RESTAURANTS], location);
        return this.restaurants;
      }
    }

    // Use mock data for development with coordinates
    this.restaurants = this.addMockCoordinates([...MOCK_RESTAURANTS], location);
    return this.restaurants;
  }

  private addMockCoordinates(restaurants: Restaurant[], location?: LocationData): Restaurant[] {
    if (!location) return restaurants;
    
    return restaurants.map((restaurant, index) => {
      // Add mock coordinates with slight variation
      const offset = 0.01 * (index + 1); // ~1km offset per restaurant
      return {
        ...restaurant,
        coordinates: {
          latitude: location.latitude + (Math.random() - 0.5) * offset,
          longitude: location.longitude + (Math.random() - 0.5) * offset,
        },
        distance: Math.random() * 5000 + 500, // 500m to 5.5km
      };
    });
  }

  getNextRestaurant(): Restaurant | null {
    if (this.currentIndex < this.restaurants.length) {
      return this.restaurants[this.currentIndex++];
    }
    return null;
  }

  reset(): void {
    this.currentIndex = 0;
  }

  getRestaurantsByCuisine(cuisines: string[]): Restaurant[] {
    return this.restaurants.filter(restaurant =>
      restaurant.cuisine.some(cuisine =>
        cuisines.some(prefCuisine =>
          cuisine.toLowerCase().includes(prefCuisine.toLowerCase()) ||
          prefCuisine.toLowerCase().includes(cuisine.toLowerCase())
        )
      )
    );
  }

  // Filter restaurants based on user preferences (reduce yuck, increase yum)
  getFilteredRestaurants(
    preferences: UserPreference[],
    maxDistance?: number
  ): Restaurant[] {
    const { likedCuisines, dislikedCuisines, cuisineScores } = analyzePreferences(preferences);
    
    // Score each restaurant based on preferences
    const scoredRestaurants = this.restaurants.map(restaurant => {
      let score = restaurant.rating || 0;
      
      // Check cuisine matches
      restaurant.cuisine.forEach(cuisine => {
        const lowerCuisine = cuisine.toLowerCase();
        const cuisineScore = cuisineScores.get(lowerCuisine) || 0;
        score += cuisineScore;
        
        // Heavy penalty for disliked cuisines
        if (dislikedCuisines.has(lowerCuisine)) {
          score -= 10;
        }
        
        // Bonus for liked cuisines
        if (likedCuisines.has(lowerCuisine)) {
          score += 5;
        }
      });

      // Distance bonus (closer = better)
      if (restaurant.distance !== undefined && maxDistance) {
        const distanceScore = (maxDistance - restaurant.distance) / maxDistance * 2;
        score += distanceScore;
      }

      return { restaurant, score };
    });

    // Filter out heavily disliked restaurants and sort by score
    const filtered = scoredRestaurants
      .filter(item => item.score > -5) // Remove restaurants with very negative scores
      .sort((a, b) => b.score - a.score)
      .map(item => item.restaurant);

    // If we have strong preferences, prioritize matching restaurants
    if (likedCuisines.size > 0 || dislikedCuisines.size > 0) {
      const matching = filtered.filter(r =>
        r.cuisine.some(c => likedCuisines.has(c.toLowerCase()))
      );
      const nonMatching = filtered.filter(r =>
        !r.cuisine.some(c => likedCuisines.has(c.toLowerCase()))
      );
      return [...matching, ...nonMatching];
    }

    return filtered;
  }

  getAllRestaurants(): Restaurant[] {
    return this.restaurants;
  }
}

export class RecipeService {
  private static instance: RecipeService;

  static getInstance(): RecipeService {
    if (!RecipeService.instance) {
      RecipeService.instance = new RecipeService();
    }
    return RecipeService.instance;
  }

  async searchRecipes(query: string, number: number = 10): Promise<Recipe[]> {
    // If Spoonacular API key is available, use real API
    if (SPOONACULAR_API_KEY) {
      try {
        const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/complexSearch`, {
          params: {
            apiKey: SPOONACULAR_API_KEY,
            query,
            number,
            addRecipeInformation: true,
            fillIngredients: true,
          },
        });

        return response.data.results.map((recipe: any) => ({
          id: recipe.id.toString(),
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes || 30,
          servings: recipe.servings || 4,
          sourceUrl: recipe.sourceUrl || '',
          summary: recipe.summary || '',
          extendedIngredients: recipe.extendedIngredients || [],
        }));
      } catch (error) {
        console.error('Error fetching from Spoonacular API:', error);
        // Fall back to mock data
        return this.getMockRecipes(query);
      }
    }

    // Use mock data for development
    return this.getMockRecipes(query);
  }

  // Get similar recipes to a given recipe ID (useful for restaurant dish matching)
  async getSimilarRecipes(recipeId: string, number: number = 5): Promise<Recipe[]> {
    if (SPOONACULAR_API_KEY) {
      try {
        const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/${recipeId}/similar`, {
          params: {
            apiKey: SPOONACULAR_API_KEY,
            number,
          },
        });

        return response.data.map((recipe: any) => ({
          id: recipe.id.toString(),
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes || 30,
          servings: recipe.servings || 4,
          sourceUrl: `https://spoonacular.com/recipes/${recipe.title}-${recipe.id}`,
          summary: '',
          extendedIngredients: [],
        }));
      } catch (error) {
        console.error('Error fetching similar recipes from Spoonacular API:', error);
        return [];
      }
    }
    return [];
  }

  // Search for recipes similar to restaurant dishes
  async getRecipesForRestaurant(restaurantName: string, cuisines: string[]): Promise<Recipe[]> {
    // First, search for recipes matching the cuisine
    const cuisineQuery = cuisines[0] || restaurantName.split(' ')[0];
    const recipes = await this.searchRecipes(cuisineQuery, 10);
    
    // If we have a recipe ID, try to get similar ones
    if (recipes.length > 0 && SPOONACULAR_API_KEY) {
      try {
        const similarRecipes = await this.getSimilarRecipes(recipes[0].id, 5);
        return [...recipes, ...similarRecipes].slice(0, 10);
      } catch (error) {
        console.error('Error getting similar recipes:', error);
      }
    }
    
    return recipes;
  }

  private getMockRecipes(query: string): Recipe[] {
    const mockRecipes: Recipe[] = [
      {
        id: '1',
        title: 'Classic Spaghetti Carbonara',
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
        readyInMinutes: 25,
        servings: 4,
        sourceUrl: 'https://example.com/recipe1',
        summary: 'A classic Italian pasta dish with eggs, cheese, and pancetta.',
      },
      {
        id: '2',
        title: 'Homemade Margherita Pizza',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
        readyInMinutes: 45,
        servings: 4,
        sourceUrl: 'https://example.com/recipe2',
        summary: 'Traditional Italian pizza with fresh mozzarella and basil.',
      },
      {
        id: '3',
        title: 'BBQ Pulled Pork',
        image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800',
        readyInMinutes: 240,
        servings: 8,
        sourceUrl: 'https://example.com/recipe3',
        summary: 'Slow-cooked pulled pork with homemade BBQ sauce.',
      },
      {
        id: '4',
        title: 'Chicken Tacos',
        image: 'https://images.unsplash.com/photo-1565299585323-38174c2d2d2a?w=800',
        readyInMinutes: 30,
        servings: 4,
        sourceUrl: 'https://example.com/recipe4',
        summary: 'Delicious chicken tacos with fresh toppings.',
      },
    ];

    // Filter by query if provided
    if (query) {
      return mockRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    return mockRecipes;
  }
}

