import axios from 'axios';
import { Restaurant, Recipe, LocationData, UserPreference, FilterPreferences } from '../types';

// Yelp Fusion API Configuration
// Note: API key is handled by serverless function, not exposed to client
const YELP_BASE_URL = '/api/yelp';

// Debug: Log API configuration
console.log('Yelp API configured to use serverless function:', YELP_BASE_URL);

// Spoonacular Recipe API Configuration
const SPOONACULAR_API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || '';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

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
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
      'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800',
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800'
    ]
  },
  {
    id: '2',
    name: 'Sushi Master',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
    cuisine: ['Japanese', 'Sushi'],
    rating: 4.8,
    price: '$$$',
    location: 'Midtown',
    photos: [
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
      'https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=800',
      'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800',
      'https://images.unsplash.com/photo-1615361200098-7f89d97b2925?w=800'
    ]
  },
  {
    id: '3',
    name: 'Burger Palace',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    cuisine: ['American', 'Burgers'],
    rating: 4.3,
    price: '$',
    location: 'Uptown',
    photos: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800',
      'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=800'
    ]
  },
  {
    id: '4',
    name: 'Taco Fiesta',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    cuisine: ['Mexican', 'Tacos'],
    rating: 4.6,
    price: '$',
    location: 'East Side',
    photos: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800',
      'https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=800',
      'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800'
    ]
  },
  {
    id: '5',
    name: 'Pizza Corner',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    cuisine: ['Italian', 'Pizza'],
    rating: 4.4,
    price: '$$',
    location: 'West End',
    photos: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800',
      'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800'
    ]
  },
  {
    id: '6',
    name: 'Thai Garden',
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
    cuisine: ['Thai', 'Asian'],
    rating: 4.7,
    price: '$$',
    location: 'South District',
    photos: [
      'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
      'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800',
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800'
    ]
  },
  {
    id: '7',
    name: 'BBQ Smokehouse',
    image: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800',
    cuisine: ['American', 'BBQ'],
    rating: 4.5,
    price: '$$',
    location: 'North Quarter',
    photos: [
      'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800',
      'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'
    ]
  },
  {
    id: '8',
    name: 'Ramen House',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    cuisine: ['Japanese', 'Ramen'],
    rating: 4.6,
    price: '$$',
    location: 'Central',
    photos: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
      'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800',
      'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=800',
      'https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=800'
    ]
  },
];

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

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
    maxDistance?: number,
    filterPreferences?: FilterPreferences
  ): Promise<Restaurant[]> {
    console.log('fetchRestaurants called with:', { location, locationString, limit, maxDistance });
    
    // Use serverless function to fetch from Yelp API
    console.log('Attempting to fetch from Yelp API via serverless function...');
    try {
        // Randomize the sort order to get different results each time
        const sortOptions = ['rating', 'best_match', 'distance'];
        const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
        
        // Add a random offset to get different results (Yelp supports up to offset 1000)
        const randomOffset = Math.floor(Math.random() * 50); // Random offset between 0-49
        
        const params: any = {
          term: 'restaurants',
          limit,
          sort_by: randomSort,
          offset: randomOffset,
        };

        // Use coordinates if available, otherwise use location string
        if (location) {
          params.latitude = location.latitude;
          params.longitude = location.longitude;
          if (maxDistance) {
            // Yelp requires radius as an integer (meters), max is 40000
            params.radius = Math.min(Math.round(maxDistance), 40000);
          }
        } else {
          params.location = locationString;
        }

        // Apply filter preferences
        if (filterPreferences?.openNow) {
          params.open_now = true;
        }

        // Price filter
        if (filterPreferences?.priceRange && filterPreferences.priceRange.length > 0) {
          // Yelp uses 1,2,3,4 for price levels
          const priceNumbers = filterPreferences.priceRange.map(p => p.length).join(',');
          params.price = priceNumbers;
        }

        console.log('Making Yelp API request with params:', params);
        console.log('Using YELP_BASE_URL:', YELP_BASE_URL);
        
        // Serverless function handles authentication, no need for headers here
        const response = await axios.get(`${YELP_BASE_URL}/businesses/search`, {
          params,
        });
        
        console.log('Yelp API response received:', response.data?.businesses?.length || 0, 'businesses');

        // Process restaurants using actual Yelp photos
        let restaurantsWithFoodImages = response.data.businesses.map((business: any) => {
            const cuisineTypes = business.categories?.map((cat: any) => cat.title) || [];
            // Use Yelp's actual restaurant photos only
            const restaurantImage = business.image_url || business.photos?.[0] || '';
            
            // Only use actual restaurant photos from Yelp
            const restaurantPhotos: string[] = [];
            
            if (restaurantImage) {
              restaurantPhotos.push(restaurantImage);
            }
            
            // Note: Yelp's Business Search API only returns 1 photo per business
            // To get more photos, we would need to call the Business Details API
            // for each individual restaurant, which would require many additional API calls
            
            const restaurant: Restaurant = {
              id: business.id,
              name: business.name,
              image: restaurantImage,
              cuisine: cuisineTypes,
              rating: business.rating,
              price: business.price,
              location: business.location?.display_address?.join(', ') || '',
              url: business.url,
              photos: restaurantPhotos, // Only real restaurant photos
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
          });

        // Apply category exclusion filter
        if (filterPreferences?.excludedCategories && filterPreferences.excludedCategories.length > 0) {
          restaurantsWithFoodImages = restaurantsWithFoodImages.filter((restaurant: Restaurant) => {
            return !restaurant.cuisine.some(cuisine => 
              filterPreferences.excludedCategories.some(excluded => 
                cuisine.toLowerCase().includes(excluded.toLowerCase()) ||
                excluded.toLowerCase().includes(cuisine.toLowerCase())
              )
            );
          });
        }

        // Remove duplicates by ID (in case API returns duplicates)
        const restaurantMap = new Map<string, Restaurant>(
          restaurantsWithFoodImages.map((r: Restaurant) => [r.id, r])
        );
        const uniqueRestaurants: Restaurant[] = Array.from(restaurantMap.values());

        // Filter by distance if maxDistance is specified
        let filtered: Restaurant[] = uniqueRestaurants;
        if (location && maxDistance) {
          filtered = uniqueRestaurants.filter((r: Restaurant) => 
            r.distance !== undefined && r.distance <= maxDistance
          );
        }

        // Add some randomization: shuffle 70% of results, keep top 30% sorted
        const topCount = Math.floor(filtered.length * 0.3);
        const sorted: Restaurant[] = [...filtered].sort((a: Restaurant, b: Restaurant) => {
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          return (b.rating || 0) - (a.rating || 0);
        });
        
        const topRestaurants: Restaurant[] = sorted.slice(0, topCount);
        const remainingRestaurants: Restaurant[] = shuffleArray(sorted.slice(topCount));
        const mixedResults: Restaurant[] = [...topRestaurants, ...remainingRestaurants];

        this.restaurants = mixedResults;
        console.log('Successfully fetched', mixedResults.length, 'restaurants from Yelp (with variety)');
        return this.restaurants;
      } catch (error: any) {
        console.error('❌ Error fetching from Yelp API:', error);
        if (error.response) {
          console.error('API Response Error:', error.response.status, error.response.data);
          console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
          console.error('API Request Error - No response received:', error.request);
          console.error('This might be a CORS error. Yelp API requires server-side requests.');
        } else {
          console.error('API Error:', error.message);
        }
        console.log('⚠️ Falling back to mock data due to API error');
        // Fall back to mock data with coordinates
        let mockRestaurants = this.addMockCoordinates([...MOCK_RESTAURANTS], location);
        
        // Apply filters to mock data
        if (filterPreferences) {
          // Apply category exclusion filter
          if (filterPreferences.excludedCategories && filterPreferences.excludedCategories.length > 0) {
            mockRestaurants = mockRestaurants.filter((restaurant: Restaurant) => {
              return !restaurant.cuisine.some(cuisine => 
                filterPreferences.excludedCategories.some(excluded => 
                  cuisine.toLowerCase().includes(excluded.toLowerCase()) ||
                  excluded.toLowerCase().includes(cuisine.toLowerCase())
                )
              );
            });
          }

          // Apply price filter
          if (filterPreferences.priceRange && filterPreferences.priceRange.length > 0) {
            mockRestaurants = mockRestaurants.filter((restaurant: Restaurant) => 
              !restaurant.price || filterPreferences.priceRange.includes(restaurant.price)
            );
          }
        }
        
        this.restaurants = mockRestaurants;
        return this.restaurants;
      }
    }
  }

  private addMockCoordinates(restaurants: Restaurant[], location?: LocationData): Restaurant[] {
    if (!location) return restaurants;
    
    return restaurants.map((restaurant, index) => {
      // Add mock coordinates with slight variation
      const offset = 0.01 * (index + 1); // ~1 mile offset per restaurant
      return {
        ...restaurant,
        coordinates: {
          latitude: location.latitude + (Math.random() - 0.5) * offset,
          longitude: location.longitude + (Math.random() - 0.5) * offset,
        },
        distance: Math.random() * 5000 + 500, // 500m to 5.5km (mock data)
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

  // Fetch detailed information about a specific restaurant
  async getRestaurantDetails(restaurantId: string): Promise<any> {
    console.log('Fetching details for restaurant:', restaurantId);
    
    try {
      const response = await axios.get(`${YELP_BASE_URL}/businesses/${restaurantId}`);
      
      console.log('Restaurant details fetched successfully');
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      return null;
    }
  }

  // Fetch reviews for a specific restaurant
  // Note: Yelp's reviews endpoint requires special approval and is not available by default
  // This is a placeholder for when/if you get API access to reviews
  async getRestaurantReviews(restaurantId: string): Promise<any> {
    console.log('Fetching reviews for restaurant:', restaurantId);
    
    try {
      // Note: This endpoint requires special approval from Yelp
      const response = await axios.get(`${YELP_BASE_URL}/businesses/${restaurantId}/reviews`, {
        params: {
          limit: 3,
          sort_by: 'yelp_sort',
        },
      });
      
      console.log('Restaurant reviews fetched successfully');
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant reviews:', error);
      console.log('Note: Yelp reviews endpoint requires special API approval');
      return null;
    }
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
    console.log('Searching recipes with query:', query);
    
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

        const recipes = response.data.results.map((recipe: any) => ({
          id: recipe.id.toString(),
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes || 30,
          servings: recipe.servings || 4,
          sourceUrl: recipe.sourceUrl || '',
          summary: recipe.summary || '',
          extendedIngredients: recipe.extendedIngredients || [],
        }));
        
        console.log('Spoonacular API returned', recipes.length, 'recipes');
        return recipes;
      } catch (error: any) {
        console.error('Error fetching from Spoonacular API:', error);
        if (error.response) {
          console.error('API Response Error:', error.response.status, error.response.data);
        }
        // Fall back to mock data
        console.log('Falling back to mock recipes');
        return this.getMockRecipes(query);
      }
    }

    // Use mock data for development
    console.log('No API key, using mock recipes');
    const mockRecipes = this.getMockRecipes(query);
    console.log('Mock recipes returned:', mockRecipes.length);
    return mockRecipes;
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
    console.log('Getting recipes for restaurant:', restaurantName, 'cuisines:', cuisines);
    
    // First, search for recipes matching the cuisine
    const cuisineQuery = cuisines[0] || restaurantName.split(' ')[0];
    const recipes = await this.searchRecipes(cuisineQuery, 10);
    
    console.log('Found recipes:', recipes.length);
    
    // If we have a recipe ID, try to get similar ones
    if (recipes.length > 0 && SPOONACULAR_API_KEY) {
      try {
        const similarRecipes = await this.getSimilarRecipes(recipes[0].id, 5);
        console.log('Found similar recipes:', similarRecipes.length);
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
      {
        id: '5',
        title: 'Sushi Rolls',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
        readyInMinutes: 60,
        servings: 4,
        sourceUrl: 'https://example.com/recipe5',
        summary: 'Homemade sushi rolls with fresh fish and vegetables.',
      },
      {
        id: '6',
        title: 'Pad Thai',
        image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
        readyInMinutes: 30,
        servings: 2,
        sourceUrl: 'https://example.com/recipe6',
        summary: 'Authentic Thai stir-fried noodles with tamarind and peanuts.',
      },
      {
        id: '7',
        title: 'Ramen Bowl',
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
        readyInMinutes: 40,
        servings: 2,
        sourceUrl: 'https://example.com/recipe7',
        summary: 'Rich and flavorful Japanese ramen with soft-boiled eggs.',
      },
      {
        id: '8',
        title: 'Beef Burger',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
        readyInMinutes: 25,
        servings: 4,
        sourceUrl: 'https://example.com/recipe8',
        summary: 'Juicy homemade beef burgers with all the fixings.',
      },
    ];

    // Map cuisine types to recipe keywords
    const cuisineMap: Record<string, string[]> = {
      'italian': ['spaghetti', 'pizza', 'pasta', 'carbonara', 'margherita'],
      'pizza': ['pizza', 'margherita'],
      'pasta': ['spaghetti', 'carbonara', 'pasta'],
      'japanese': ['sushi', 'ramen', 'japanese'],
      'sushi': ['sushi'],
      'ramen': ['ramen'],
      'thai': ['thai', 'pad thai'],
      'asian': ['sushi', 'ramen', 'thai', 'pad thai'],
      'mexican': ['tacos', 'chicken tacos'],
      'tacos': ['tacos'],
      'american': ['burger', 'bbq', 'pulled pork'],
      'burger': ['burger'],
      'bbq': ['bbq', 'pulled pork'],
      'burgers': ['burger'],
    };

    // Filter by query if provided
    if (query) {
      const lowerQuery = query.toLowerCase();
      
      // Try to find matching recipes by cuisine keywords
      const matchingRecipes = mockRecipes.filter(recipe => {
        const lowerTitle = recipe.title.toLowerCase();
        const lowerSummary = recipe.summary.toLowerCase();
        
        // Check if query matches any cuisine keywords
        if (cuisineMap[lowerQuery]) {
          return cuisineMap[lowerQuery].some(keyword => 
            lowerTitle.includes(keyword) || lowerSummary.includes(keyword)
          );
        }
        
        // Check if query matches title or summary
        return lowerTitle.includes(lowerQuery) || lowerSummary.includes(lowerQuery);
      });
      
      // If we found matches, return them; otherwise return all recipes
      return matchingRecipes.length > 0 ? matchingRecipes : mockRecipes;
    }

    return mockRecipes;
  }
}

