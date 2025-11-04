import { useEffect, useState } from 'react';
import { Restaurant, Recipe, UserPreference } from '../types';
import { RestaurantService, RecipeService } from '../services/api';
import RestaurantModal from './RestaurantModal';
import './OptionsView.css';

interface OptionsViewProps {
  preferences: UserPreference[];
  onBack: () => void;
}

type SortOption = 'default' | 'distance' | 'price' | 'rating';

export default function OptionsView({ preferences, onBack }: OptionsViewProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'restaurants' | 'recipes'>('restaurants');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isDuelMode, setIsDuelMode] = useState(false);
  const [showDuelModeSelection, setShowDuelModeSelection] = useState(false);
  const [duelContenders, setDuelContenders] = useState<Restaurant[]>([]);
  const [currentDuelPair, setCurrentDuelPair] = useState<[Restaurant, Restaurant] | null>(null);
  const [duelWinner, setDuelWinner] = useState<Restaurant | null>(null);
  const [eliminatingId, setEliminatingId] = useState<string | null>(null);
  const [eliminationEffect, setEliminationEffect] = useState<'burn' | 'chop'>('burn');
  const [winningId, setWinningId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
    const similarRestaurants = restaurantService.getRestaurantsByCuisine(cuisineArray);
    
    // Create sets of restaurant IDs to filter out
    const yumRestaurantIds = new Set(yumPreferences.map(p => p.restaurantId));
    const yuckRestaurantIds = new Set(
      preferences.filter(p => p.preference === 'yuck').map(p => p.restaurantId)
    );
    const maybeRestaurantIds = new Set(
      preferences.filter(p => p.preference === 'maybe').map(p => p.restaurantId)
    );
    
    // Combine yum restaurants with similar ones, excluding yuck/maybe and removing duplicates
    const uniqueRestaurants = [
      ...yumPreferences.map(p => p.restaurant),
      ...similarRestaurants.filter(r => 
        !yumRestaurantIds.has(r.id) && 
        !yuckRestaurantIds.has(r.id) &&
        !maybeRestaurantIds.has(r.id)
      )
    ];
    
    setRestaurants(uniqueRestaurants);

    // Get recipes similar to restaurant dishes
    try {
      const recipeService = RecipeService.getInstance();
      const recipePromises = yumPreferences.slice(0, 5).map(pref => 
        recipeService.getRecipesForRestaurant(pref.restaurant.name, pref.restaurant.cuisine)
      );
      
      const recipeResults = await Promise.all(recipePromises);
      const allRecipes = recipeResults.flat();
      
      console.log('All recipes from promises:', allRecipes.length);
      
      // Remove duplicates by ID
      const uniqueRecipes = Array.from(
        new Map(allRecipes.map(r => [r.id, r])).values()
      );
      
      console.log('Unique recipes:', uniqueRecipes.length);
      setRecipes(uniqueRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
      setRecipes([]);
    }
    
    setLoading(false);
  };

  const showDuelSelection = () => {
    if (restaurants.length < 2) {
      alert('You need at least 2 restaurants to start a duel!');
      return;
    }
    setShowDuelModeSelection(true);
  };

  const startDuelMode = (onlyYumOptions: boolean) => {
    let restaurantsToUse: Restaurant[] = [];
    
    if (onlyYumOptions) {
      // Only use restaurants that were marked as "yum"
      const yumRestaurants = preferences
        .filter(p => p.preference === 'yum')
        .map(p => p.restaurant);
      
      if (yumRestaurants.length < 2) {
        alert('You need at least 2 "Yum" restaurants to start a duel!');
        return;
      }
      restaurantsToUse = yumRestaurants;
    } else {
      // Use all restaurants (yum + recommendations)
      restaurantsToUse = restaurants;
    }
    
    // Shuffle restaurants for random matchups
    const shuffled = [...restaurantsToUse].sort(() => Math.random() - 0.5);
    setDuelContenders(shuffled);
    setCurrentDuelPair([shuffled[0], shuffled[1]]);
    setIsDuelMode(true);
    setShowDuelModeSelection(false);
    setDuelWinner(null);
  };

  const handleDuelChoice = (winner: Restaurant) => {
    // Find the loser
    const loser = currentDuelPair![0].id === winner.id ? currentDuelPair![1] : currentDuelPair![0];
    
    // Randomly choose elimination effect
    const effects: ('burn' | 'chop')[] = ['burn', 'chop'];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    setEliminationEffect(randomEffect);
    
    // Show winner and elimination animations simultaneously
    setWinningId(winner.id);
    setEliminatingId(loser.id);
    
    // Wait for animation to complete
    setTimeout(() => {
      setEliminatingId(null);
      setWinningId(null);
      
      // Find the loser and remove from contenders
      const remainingContenders = duelContenders.filter(r => 
        r.id !== currentDuelPair![0].id && r.id !== currentDuelPair![1].id
      );
      
      // Add winner back to the pool
      const newContenders = [...remainingContenders, winner];
      
      if (newContenders.length === 1) {
        // We have a final winner!
        setDuelWinner(newContenders[0]);
        setCurrentDuelPair(null);
        setDuelContenders([]);
        return;
      }
      
      // Set up next duel with transition
      if (newContenders.length >= 2) {
        setIsTransitioning(true);
        setDuelContenders(newContenders);
        
        // Small delay to ensure fade out completes before fade in
        setTimeout(() => {
          setCurrentDuelPair([newContenders[0], newContenders[1]]);
          setIsTransitioning(false);
        }, 100);
      }
    }, 800);
  };

  const exitDuelMode = () => {
    setIsDuelMode(false);
    setShowDuelModeSelection(false);
    setDuelContenders([]);
    setCurrentDuelPair(null);
    setDuelWinner(null);
    setEliminatingId(null);
    setWinningId(null);
    setIsTransitioning(false);
  };

  const getSortedRestaurants = (): Restaurant[] => {
    const sorted = [...restaurants];
    
    switch (sortBy) {
      case 'distance':
        return sorted.sort((a, b) => {
          // Put restaurants without distance at the end
          if (a.distance === undefined && b.distance === undefined) return 0;
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });
      
      case 'price':
        return sorted.sort((a, b) => {
          // Convert price symbols to numbers for sorting
          const priceToNum = (price?: string) => {
            if (!price) return 5; // Put no-price items at end
            return price.length; // $=1, $$=2, $$$=3, $$$$=4
          };
          return priceToNum(a.price) - priceToNum(b.price);
        });
      
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      
      case 'default':
      default:
        return sorted;
    }
  };

  if (loading) {
    return (
      <div className="options-view">
        <div className="loading-spinner">Loading your options...</div>
      </div>
    );
  }

  // Render Duel Mode Selection Screen
  if (showDuelModeSelection) {
    const yumCount = preferences.filter(p => p.preference === 'yum').length;
    
    return (
      <div className="options-view">
        <div className="options-header">
          <button className="back-button" onClick={() => setShowDuelModeSelection(false)}>
            ← Back to Options
          </button>
          <h1 className="options-title">⚔️ Choose Your Duel Mode</h1>
        </div>
        <div className="duel-mode-selection">
          <p className="duel-selection-subtitle">How do you want to narrow down your options?</p>
          
          <div className="duel-mode-options">
            <button 
              className="duel-mode-option"
              onClick={() => startDuelMode(true)}
            >
              <div className="duel-mode-icon">😋</div>
              <h3 className="duel-mode-title">Only My Favorites</h3>
              <p className="duel-mode-description">
                Duel with only the {yumCount} restaurant{yumCount !== 1 ? 's' : ''} you marked as "Yum"
              </p>
              <div className="duel-mode-badge">Quick Decision</div>
            </button>
            
            <button 
              className="duel-mode-option"
              onClick={() => startDuelMode(false)}
            >
              <div className="duel-mode-icon">🎯</div>
              <h3 className="duel-mode-title">Include Recommendations</h3>
              <p className="duel-mode-description">
                Duel with all {restaurants.length} options including similar restaurants you may like
              </p>
              <div className="duel-mode-badge">More Choices</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Duel Mode UI
  if (isDuelMode) {
    if (duelWinner) {
      return (
        <div className="options-view">
          <div className="options-header">
            <button className="back-button" onClick={exitDuelMode}>
              ← Back to Options
            </button>
            <h1 className="options-title">🏆 Winner!</h1>
          </div>
          <div className="duel-winner-container">
            {/* Food Confetti */}
            <div className="food-confetti-container">
              {Array.from({ length: 30 }).map((_, i) => {
                const foodEmojis = ['🍕', '🍔', '🌮', '🍟', '🍗', '🍜', '🍱', '🍣', '🥗', '🥪', '🌯', '🍝'];
                const randomFood = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
                return (
                  <div 
                    key={i} 
                    className="food-confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`
                    }}
                  >
                    {randomFood}
                  </div>
                );
              })}
            </div>
            
            <div className="duel-winner-card">
              <div className="winner-crown">👑</div>
              <img 
                src={duelWinner.image} 
                alt={duelWinner.name}
                className="duel-winner-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Winner';
                }}
              />
              <div className="duel-winner-content">
                <h2 className="duel-winner-name">{duelWinner.name}</h2>
                <div className="duel-winner-meta">
                  <span className="restaurant-rating">⭐ {duelWinner.rating}</span>
                  {duelWinner.price && (
                    <span className="restaurant-price">{duelWinner.price}</span>
                  )}
                  {duelWinner.distance !== undefined && (
                    <span className="restaurant-distance">
                      📍 {duelWinner.distance < 1000 
                        ? `${Math.round(duelWinner.distance)}m` 
                        : `${(duelWinner.distance / 1609.34).toFixed(1)} miles`}
                    </span>
                  )}
                </div>
                <div className="restaurant-cuisine">
                  {duelWinner.cuisine.map((cuisine, index) => (
                    <span key={index} className="cuisine-badge">{cuisine}</span>
                  ))}
                </div>
                <button 
                  className="duel-view-details-button"
                  onClick={() => setSelectedRestaurant(duelWinner)}
                >
                  View Details →
                </button>
                <button 
                  className="duel-restart-button"
                  onClick={showDuelSelection}
                >
                  🔄 Start New Duel
                </button>
              </div>
            </div>
          </div>
          
          {/* Restaurant Modal for Winner */}
          {selectedRestaurant && (
            <RestaurantModal 
              restaurant={selectedRestaurant}
              onClose={() => setSelectedRestaurant(null)}
            />
          )}
        </div>
      );
    }

    if (currentDuelPair) {
      return (
        <div className="options-view">
          <div className="options-header">
            <button className="back-button" onClick={exitDuelMode}>
              ← Exit Duel Mode
            </button>
            <h1 className="options-title">⚔️ This or That?</h1>
            <p className="duel-counter">{duelContenders.length} contenders remaining</p>
          </div>
          <div className={`duel-container ${isTransitioning ? 'transitioning' : ''}`} key={`duel-${currentDuelPair[0].id}-${currentDuelPair[1].id}`}>
            <div 
              className={`duel-card duel-card-left ${
                eliminatingId === currentDuelPair[0].id ? `eliminating eliminating-${eliminationEffect}` : 
                winningId === currentDuelPair[0].id ? 'winning' : ''
              }`}
              onClick={() => !eliminatingId && !winningId && !isTransitioning && handleDuelChoice(currentDuelPair[0])}
            >
              <img 
                src={currentDuelPair[0].image} 
                alt={currentDuelPair[0].name}
                className="duel-card-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Restaurant';
                }}
              />
              <div className="duel-card-content">
                <h3 className="duel-card-name">{currentDuelPair[0].name}</h3>
                <div className="duel-card-meta">
                  <span>⭐ {currentDuelPair[0].rating}</span>
                  {currentDuelPair[0].price && <span>{currentDuelPair[0].price}</span>}
                  {currentDuelPair[0].distance !== undefined && (
                    <span>
                      📍 {currentDuelPair[0].distance < 1000 
                        ? `${Math.round(currentDuelPair[0].distance)}m` 
                        : `${(currentDuelPair[0].distance / 1609.34).toFixed(1)} mi`}
                    </span>
                  )}
                </div>
                <div className="duel-card-cuisine">
                  {currentDuelPair[0].cuisine.map((cuisine, index) => (
                    <span key={index} className="cuisine-badge">{cuisine}</span>
                  ))}
                </div>
              </div>
              {!eliminatingId && !winningId && (
                <div className="duel-overlay">
                  <span className="duel-choose-text">Choose This!</span>
                </div>
              )}
              {winningId === currentDuelPair[0].id && (
                <div className="winner-effect">
                  <div className="winner-glow"></div>
                  <div className="winner-sparkles">
                    <div className="sparkle sparkle-1">✨</div>
                    <div className="sparkle sparkle-2">⭐</div>
                    <div className="sparkle sparkle-3">✨</div>
                    <div className="sparkle sparkle-4">⭐</div>
                    <div className="sparkle sparkle-5">✨</div>
                    <div className="sparkle sparkle-6">⭐</div>
                  </div>
                  <div className="winner-text">YUM!</div>
                </div>
              )}
              {eliminatingId === currentDuelPair[0].id && eliminationEffect === 'burn' && (
                <div className="elimination-effect burn-effect">
                  <div className="fire-container">
                    <div className="fire-flame flame-1"></div>
                    <div className="fire-flame flame-2"></div>
                    <div className="fire-flame flame-3"></div>
                    <div className="fire-flame flame-4"></div>
                    <div className="fire-flame flame-5"></div>
                  </div>
                  <div className="smoke-container">
                    <div className="smoke smoke-1"></div>
                    <div className="smoke smoke-2"></div>
                    <div className="smoke smoke-3"></div>
                  </div>
                </div>
              )}
              {eliminatingId === currentDuelPair[0].id && eliminationEffect === 'chop' && (
                <div className="elimination-effect chop-effect">
                  <div className="chop-line chop-1"></div>
                  <div className="chop-line chop-2"></div>
                  <div className="chop-line chop-3"></div>
                  <div className="chop-line chop-4"></div>
                  <div className="chop-pieces">
                    <div className="piece piece-1"></div>
                    <div className="piece piece-2"></div>
                    <div className="piece piece-3"></div>
                    <div className="piece piece-4"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="duel-vs">VS</div>

            <div 
              className={`duel-card duel-card-right ${
                eliminatingId === currentDuelPair[1].id ? `eliminating eliminating-${eliminationEffect}` : 
                winningId === currentDuelPair[1].id ? 'winning' : ''
              }`}
              onClick={() => !eliminatingId && !winningId && !isTransitioning && handleDuelChoice(currentDuelPair[1])}
            >
              <img 
                src={currentDuelPair[1].image} 
                alt={currentDuelPair[1].name}
                className="duel-card-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Restaurant';
                }}
              />
              <div className="duel-card-content">
                <h3 className="duel-card-name">{currentDuelPair[1].name}</h3>
                <div className="duel-card-meta">
                  <span>⭐ {currentDuelPair[1].rating}</span>
                  {currentDuelPair[1].price && <span>{currentDuelPair[1].price}</span>}
                  {currentDuelPair[1].distance !== undefined && (
                    <span>
                      📍 {currentDuelPair[1].distance < 1000 
                        ? `${Math.round(currentDuelPair[1].distance)}m` 
                        : `${(currentDuelPair[1].distance / 1609.34).toFixed(1)} mi`}
                    </span>
                  )}
                </div>
                <div className="duel-card-cuisine">
                  {currentDuelPair[1].cuisine.map((cuisine, index) => (
                    <span key={index} className="cuisine-badge">{cuisine}</span>
                  ))}
                </div>
              </div>
              {!eliminatingId && !winningId && (
                <div className="duel-overlay">
                  <span className="duel-choose-text">Choose This!</span>
                </div>
              )}
              {winningId === currentDuelPair[1].id && (
                <div className="winner-effect">
                  <div className="winner-glow"></div>
                  <div className="winner-sparkles">
                    <div className="sparkle sparkle-1">✨</div>
                    <div className="sparkle sparkle-2">⭐</div>
                    <div className="sparkle sparkle-3">✨</div>
                    <div className="sparkle sparkle-4">⭐</div>
                    <div className="sparkle sparkle-5">✨</div>
                    <div className="sparkle sparkle-6">⭐</div>
                  </div>
                  <div className="winner-text">YUM!</div>
                </div>
              )}
              {eliminatingId === currentDuelPair[1].id && eliminationEffect === 'burn' && (
                <div className="elimination-effect burn-effect">
                  <div className="fire-container">
                    <div className="fire-flame flame-1"></div>
                    <div className="fire-flame flame-2"></div>
                    <div className="fire-flame flame-3"></div>
                    <div className="fire-flame flame-4"></div>
                    <div className="fire-flame flame-5"></div>
                  </div>
                  <div className="smoke-container">
                    <div className="smoke smoke-1"></div>
                    <div className="smoke smoke-2"></div>
                    <div className="smoke smoke-3"></div>
                  </div>
                </div>
              )}
              {eliminatingId === currentDuelPair[1].id && eliminationEffect === 'chop' && (
                <div className="elimination-effect chop-effect">
                  <div className="chop-line chop-1"></div>
                  <div className="chop-line chop-2"></div>
                  <div className="chop-line chop-3"></div>
                  <div className="chop-line chop-4"></div>
                  <div className="chop-pieces">
                    <div className="piece piece-1"></div>
                    <div className="piece piece-2"></div>
                    <div className="piece piece-3"></div>
                    <div className="piece piece-4"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Restaurant Modal for Duel Pairs */}
          {selectedRestaurant && (
            <RestaurantModal 
              restaurant={selectedRestaurant}
              onClose={() => setSelectedRestaurant(null)}
            />
          )}
        </div>
      );
    }
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
          <button
            className={`tab-button tab-button-duel`}
            onClick={showDuelSelection}
            disabled={restaurants.length < 2}
          >
            ⚔️ Duel Mode
          </button>
        </div>
      </div>

      {activeTab === 'restaurants' && restaurants.length > 0 && (
        <div className="sort-controls">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="sort-dropdown"
          >
            <option value="default">Default</option>
            <option value="distance">Distance (closest first)</option>
            <option value="price">Price (lowest first)</option>
            <option value="rating">Rating (highest first)</option>
          </select>
        </div>
      )}

      <div className="options-content">
        {activeTab === 'restaurants' ? (
          <div className="restaurants-grid">
            {restaurants.length === 0 ? (
              <div className="empty-state">
                <p>No restaurants found. Start swiping to add preferences!</p>
              </div>
            ) : (
              getSortedRestaurants().map(restaurant => (
                <div 
                  key={restaurant.id} 
                  className="restaurant-card"
                  onClick={() => setSelectedRestaurant(restaurant)}
                  style={{ cursor: 'pointer' }}
                >
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
                            : `${(restaurant.distance / 1609.34).toFixed(1)} miles`}
                        </span>
                      )}
                    </div>
                    <div className="restaurant-cuisine">
                      {restaurant.cuisine.map((cuisine, index) => (
                        <span key={index} className="cuisine-badge">{cuisine}</span>
                      ))}
                    </div>
                    <button className="restaurant-view-details">
                      View Details →
                    </button>
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

      {/* Restaurant Modal */}
      {selectedRestaurant && (
        <RestaurantModal 
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
        />
      )}
    </div>
  );
}

