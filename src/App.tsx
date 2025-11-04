import { useState, useEffect } from 'react';
import { Restaurant, Preference, UserPreference } from './types';
import { RestaurantService } from './services/api';
import FoodCard from './components/FoodCard';
import OptionsView from './components/OptionsView';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    setLoading(true);
    const restaurantService = RestaurantService.getInstance();
    const fetchedRestaurants = await restaurantService.fetchRestaurants();
    setRestaurants(fetchedRestaurants);
    setLoading(false);
  };

  const handleSwipe = (preference: Preference) => {
    if (currentIndex >= restaurants.length) return;

    const currentRestaurant = restaurants[currentIndex];
    const direction = preference === 'yum' ? 'right' : 'left';
    
    setPreferences(prev => [
      ...prev,
      {
        restaurantId: currentRestaurant.id,
        preference,
        restaurant: currentRestaurant,
      }
    ]);

    setSwipeDirection(direction);
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 400);
  };

  const handleDragEnd = () => {
    // Reset any drag-related state if needed
  };

  const currentRestaurant = restaurants[currentIndex];
  const yumCount = preferences.filter(p => p.preference === 'yum').length;

  if (showOptions) {
    return <OptionsView preferences={preferences} onBack={() => setShowOptions(false)} />;
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1 className="app-title">🍽️ Hangry</h1>
        <button 
          className="options-button"
          onClick={() => setShowOptions(true)}
          disabled={yumCount === 0}
        >
          Show My Options ({yumCount})
        </button>
      </div>

      <div className="swipe-container">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Finding delicious restaurants...</p>
          </div>
        ) : currentRestaurant ? (
          <>
            <AnimatePresence mode="popLayout">
              {/* Stack of cards for visual depth */}
              {restaurants.slice(currentIndex, currentIndex + 3).map((restaurant, idx) => {
                if (idx === 0) {
                  return (
                    <FoodCard
                      key={`${restaurant.id}-${currentIndex}`}
                      restaurant={restaurant}
                      onSwipe={handleSwipe}
                      onDragEnd={handleDragEnd}
                      zIndex={restaurants.length - currentIndex - idx}
                    />
                  );
                }
                return (
                  <motion.div
                    key={restaurant.id}
                    className="food-card food-card-stack"
                    style={{
                      zIndex: restaurants.length - currentIndex - idx,
                      transform: `scale(${1 - idx * 0.05}) translateY(${idx * 10}px)`,
                      opacity: 1 - idx * 0.3,
                    }}
                  >
                    <div className="food-card-image-container">
                      <img 
                        src={restaurant.image} 
                        alt={restaurant.name}
                        className="food-card-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Food+Image';
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Swipe feedback overlay */}
            {swipeDirection && (
              <motion.div
                className={`swipe-feedback ${swipeDirection === 'right' ? 'swipe-yum' : 'swipe-yuck'}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {swipeDirection === 'right' ? 'YUM! 😋' : 'YUCK! 😝'}
              </motion.div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <h2>All done! 🎉</h2>
            <p>You've seen all available restaurants.</p>
            {yumCount > 0 && (
              <button 
                className="primary-button"
                onClick={() => setShowOptions(true)}
              >
                Show My Options ({yumCount})
              </button>
            )}
            <button 
              className="secondary-button"
              onClick={() => {
                setCurrentIndex(0);
                setPreferences([]);
              }}
            >
              Start Over
            </button>
          </div>
        )}
      </div>

      {currentRestaurant && (
        <div className="action-buttons">
          <button
            className="action-button action-button-yuck"
            onClick={() => handleSwipe('yuck')}
            aria-label="Yuck"
          >
            😝 Yuck
          </button>
          <button
            className="action-button action-button-maybe"
            onClick={() => handleSwipe('maybe')}
            aria-label="Maybe"
          >
            🤔 Maybe
          </button>
          <button
            className="action-button action-button-yum"
            onClick={() => handleSwipe('yum')}
            aria-label="Yum"
          >
            😋 Yum
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

