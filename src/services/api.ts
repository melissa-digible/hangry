import axios from 'axios';
import { Restaurant, Recipe } from '../types';

// Yelp Fusion API Configuration
// Note: In production, these should be stored in environment variables
const YELP_API_KEY = import.meta.env.VITE_YELP_API_KEY || '';
const YELP_BASE_URL = 'https://api.yelp.com/v3';

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

  async fetchRestaurants(location: string = 'San Francisco', limit: number = 20): Promise<Restaurant[]> {
    // If Yelp API key is available, use real API
    if (YELP_API_KEY) {
      try {
        const response = await axios.get(`${YELP_BASE_URL}/businesses/search`, {
          headers: {
            'Authorization': `Bearer ${YELP_API_KEY}`,
          },
          params: {
            location,
            term: 'restaurants',
            limit,
            sort_by: 'rating',
          },
        });

        this.restaurants = response.data.businesses.map((business: any) => ({
          id: business.id,
          name: business.name,
          image: business.image_url || business.photos?.[0] || '',
          cuisine: business.categories?.map((cat: any) => cat.title) || [],
          rating: business.rating,
          price: business.price,
          location: business.location?.display_address?.join(', ') || '',
          url: business.url,
          photos: business.photos || [],
        }));

        return this.restaurants;
      } catch (error) {
        console.error('Error fetching from Yelp API:', error);
        // Fall back to mock data
        this.restaurants = [...MOCK_RESTAURANTS];
        return this.restaurants;
      }
    }

    // Use mock data for development
    this.restaurants = [...MOCK_RESTAURANTS];
    return this.restaurants;
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

