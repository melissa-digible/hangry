import { useEffect, useState } from 'react';
import { Restaurant, Recipe, UserPreference } from '../types';
import { RestaurantService, RecipeService } from '../services/api';
import './OptionsView.css';

interface OptionsViewProps {
  preferences: UserPreference[];
  onBack: () => void;
}

export default function OptionsView({ preferences, onBack }: OptionsViewProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'restaurants' | 'recipes'>('restaurants');

  useEffect(() => {
    loadOptions();
  }, [preferences]);

  const loadOptions = async () => {
    setLoading(true);
    
    // Get all "yum" preferences
    const yumPreferences = preferences.filter(p => p.preference === 'yum');
    
    if (yumPreferences.length === 0) {
      setLoading(false);
      return;
    }

    // Extract unique cuisines from yum preferences
    const cuisines = new Set<string>();
    yumPreferences.forEach(pref => {
      pref.restaurant.cuisine.forEach(c => cuisines.add(c));
    });

    const cuisineArray = Array.from(cuisines);
    
    // Get similar restaurants
    const restaurantService = RestaurantService.getInstance();
    const allRestaurants = restaurantService.getAllRestaurants();
    const similarRestaurants = restaurantService.getRestaurantsByCuisine(cuisineArray);
    
    // Combine yum restaurants with similar ones, removing duplicates
    const yumRestaurantIds = new Set(yumPreferences.map(p => p.restaurantId));
    const uniqueRestaurants = [
      ...yumPreferences.map(p => p.restaurant),
      ...similarRestaurants.filter(r => !yumRestaurantIds.has(r.id))
    ];
    
    setRestaurants(uniqueRestaurants);

    // Get recipes similar to restaurant dishes
    const recipeService = RecipeService.getInstance();
    const recipePromises = yumPreferences.slice(0, 5).map(pref => 
      recipeService.getRecipesForRestaurant(pref.restaurant.name, pref.restaurant.cuisine)
    );
    
    const recipeResults = await Promise.all(recipePromises);
    const allRecipes = recipeResults.flat();
    
    // Remove duplicates by ID
    const uniqueRecipes = Array.from(
      new Map(allRecipes.map(r => [r.id, r])).values()
    );
    
    setRecipes(uniqueRecipes);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="options-view">
        <div className="loading-spinner">Loading your options...</div>
      </div>
    );
  }

  return (
    <div className="options-view">
      <div className="options-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Swiping
        </button>
        <h1 className="options-title">Your Options</h1>
        <div className="options-tabs">
          <button
            className={`tab-button ${activeTab === 'restaurants' ? 'active' : ''}`}
            onClick={() => setActiveTab('restaurants')}
          >
            Restaurants ({restaurants.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            Recipes ({recipes.length})
          </button>
        </div>
      </div>

      <div className="options-content">
        {activeTab === 'restaurants' ? (
          <div className="restaurants-grid">
            {restaurants.length === 0 ? (
              <div className="empty-state">
                <p>No restaurants found. Start swiping to add preferences!</p>
              </div>
            ) : (
              restaurants.map(restaurant => (
                <div key={restaurant.id} className="restaurant-card">
                  <img 
                    src={restaurant.image} 
                    alt={restaurant.name}
                    className="restaurant-card-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Food';
                    }}
                  />
                  <div className="restaurant-card-content">
                    <h3 className="restaurant-card-name">{restaurant.name}</h3>
                    <div className="restaurant-card-meta">
                      <span className="restaurant-rating">⭐ {restaurant.rating}</span>
                      {restaurant.price && (
                        <span className="restaurant-price">{restaurant.price}</span>
                      )}
                      {restaurant.distance !== undefined && (
                        <span className="restaurant-distance">
                          📍 {restaurant.distance < 1000 
                            ? `${Math.round(restaurant.distance)}m` 
                            : `${(restaurant.distance / 1000).toFixed(1)}km`}
                        </span>
                      )}
                    </div>
                    <div className="restaurant-cuisine">
                      {restaurant.cuisine.map((cuisine, index) => (
                        <span key={index} className="cuisine-badge">{cuisine}</span>
                      ))}
                    </div>
                    {restaurant.url && (
                      <a 
                        href={restaurant.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="restaurant-link"
                      >
                        View on Yelp →
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="recipes-grid">
            {recipes.length === 0 ? (
              <div className="empty-state">
                <p>No recipes found. Start swiping to get recipe suggestions!</p>
              </div>
            ) : (
              recipes.map(recipe => (
                <div key={recipe.id} className="recipe-card">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title}
                    className="recipe-card-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Recipe';
                    }}
                  />
                  <div className="recipe-card-content">
                    <h3 className="recipe-card-title">{recipe.title}</h3>
                    <div className="recipe-meta">
                      <span>⏱️ {recipe.readyInMinutes} min</span>
                      <span>🍽️ {recipe.servings} servings</span>
                    </div>
                    {recipe.summary && (
                      <p className="recipe-summary" dangerouslySetInnerHTML={{ __html: recipe.summary.substring(0, 150) + '...' }} />
                    )}
                    {recipe.sourceUrl && (
                      <a 
                        href={recipe.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="recipe-link"
                      >
                        View Recipe →
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

