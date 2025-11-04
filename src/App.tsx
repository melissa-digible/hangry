import { useState, useEffect } from 'react';
import { Restaurant, Preference, UserPreference, LocationData, DistancePreference } from './types';
import { RestaurantService } from './services/api';
import FoodCard from './components/FoodCard';
import OptionsView from './components/OptionsView';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'maybe' | null>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [distancePreference, setDistancePreference] = useState<DistancePreference>({
    maxDistance: 10, // 10km default
    unit: 'km',
  });
  const [showDistanceSettings, setShowDistanceSettings] = useState(false);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    const loadRestaurantsAsync = async () => {
      setLoading(true);
      const restaurantService = RestaurantService.getInstance();
      const maxDistanceMeters = distancePreference.unit === 'km' 
        ? distancePreference.maxDistance * 1000 
        : distancePreference.maxDistance * 1609.34; // miles to meters
      
      const fetchedRestaurants = await restaurantService.fetchRestaurants(
        userLocation || undefined,
        'San Francisco',
        50,
        maxDistanceMeters
      );
      setRestaurants(fetchedRestaurants);
      setFilteredRestaurants(fetchedRestaurants);
      setLoading(false);
    };

    if (userLocation || locationError) {
      loadRestaurantsAsync();
    }
  }, [userLocation, distancePreference, locationError]);

  useEffect(() => {
    // Apply preference-based filtering when preferences change
    if (restaurants.length > 0 && preferences.length > 0) {
      const restaurantService = RestaurantService.getInstance();
      const maxDistanceMeters = distancePreference.unit === 'km' 
        ? distancePreference.maxDistance * 1000 
        : distancePreference.maxDistance * 1609.34;
      
      const filtered = restaurantService.getFilteredRestaurants(preferences, maxDistanceMeters);
      setFilteredRestaurants(filtered);
      // Reset index if we're filtering and current index might be out of bounds
      if (currentIndex >= filtered.length) {
        setCurrentIndex(0);
      }
    } else {
      setFilteredRestaurants(restaurants);
    }
  }, [preferences, restaurants, distancePreference, currentIndex]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationError(null);
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationError('Unable to get your location. Using default location.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const loadRestaurants = async () => {
    setLoading(true);
    const restaurantService = RestaurantService.getInstance();
    const maxDistanceMeters = distancePreference.unit === 'km' 
      ? distancePreference.maxDistance * 1000 
      : distancePreference.maxDistance * 1609.34; // miles to meters
    
    const fetchedRestaurants = await restaurantService.fetchRestaurants(
      userLocation || undefined,
      'San Francisco',
      50,
      maxDistanceMeters
    );
    setRestaurants(fetchedRestaurants);
    setFilteredRestaurants(fetchedRestaurants);
    setLoading(false);
  };

  const handleSwipe = (preference: Preference) => {
    const restaurantsToUse = filteredRestaurants.length > 0 ? filteredRestaurants : restaurants;
    if (currentIndex >= restaurantsToUse.length) return;

    const currentRestaurant = restaurantsToUse[currentIndex];
    const direction = preference === 'yum' ? 'right' : preference === 'yuck' ? 'left' : 'maybe';
    
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
      // Filtering will be applied automatically by useEffect
    }, 400);
  };

  const handleDragEnd = () => {
    // Reset any drag-related state if needed
  };

  const restaurantsToUse = filteredRestaurants.length > 0 ? filteredRestaurants : restaurants;
  const currentRestaurant = restaurantsToUse[currentIndex];
  const yumCount = preferences.filter(p => p.preference === 'yum').length;

  if (showOptions) {
    return <OptionsView preferences={preferences} onBack={() => setShowOptions(false)} />;
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1 className="app-title">🍽️ Hangry</h1>
        <div className="header-actions">
          <button 
            className="settings-button"
            onClick={() => setShowDistanceSettings(!showDistanceSettings)}
            title="Distance Settings"
          >
            📍
          </button>
          <button 
            className="options-button"
            onClick={() => setShowOptions(true)}
            disabled={yumCount === 0}
          >
            Show My Options ({yumCount})
          </button>
        </div>
      </div>

      {showDistanceSettings && (
        <div className="distance-settings">
          <h3>Distance Preference</h3>
          <div className="distance-controls">
            <label>
              Max Distance: {distancePreference.maxDistance} {distancePreference.unit}
              <input
                type="range"
                min="1"
                max={distancePreference.unit === 'km' ? '50' : '30'}
                value={distancePreference.maxDistance}
                onChange={(e) => setDistancePreference({
                  ...distancePreference,
                  maxDistance: parseInt(e.target.value),
                })}
              />
            </label>
            <div className="unit-toggle">
              <button
                className={distancePreference.unit === 'km' ? 'active' : ''}
                onClick={() => {
                  const newValue = distancePreference.unit === 'miles' 
                    ? Math.round(distancePreference.maxDistance * 1.60934)
                    : distancePreference.maxDistance;
                  setDistancePreference({
                    maxDistance: newValue,
                    unit: 'km',
                  });
                }}
              >
                km
              </button>
              <button
                className={distancePreference.unit === 'miles' ? 'active' : ''}
                onClick={() => {
                  const newValue = distancePreference.unit === 'km' 
                    ? Math.round(distancePreference.maxDistance / 1.60934)
                    : distancePreference.maxDistance;
                  setDistancePreference({
                    maxDistance: newValue,
                    unit: 'miles',
                  });
                }}
              >
                miles
              </button>
            </div>
          </div>
          {locationError && (
            <p className="location-warning">⚠️ {locationError}</p>
          )}
          {userLocation && (
            <p className="location-success">✓ Using your current location</p>
          )}
          <button 
            className="location-button"
            onClick={getUserLocation}
          >
            🔄 Refresh Location
          </button>
        </div>
      )}

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
              {restaurantsToUse.slice(currentIndex, currentIndex + 3).map((restaurant, idx) => {
                if (idx === 0) {
                  return (
                    <FoodCard
                      key={`${restaurant.id}-${currentIndex}`}
                      restaurant={restaurant}
                      onSwipe={handleSwipe}
                      onDragEnd={handleDragEnd}
                      zIndex={restaurantsToUse.length - currentIndex - idx}
                    />
                  );
                }
                return (
                  <motion.div
                    key={restaurant.id}
                    className="food-card food-card-stack"
                    style={{
                      zIndex: restaurantsToUse.length - currentIndex - idx,
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
                className={`swipe-feedback ${
                  swipeDirection === 'right' ? 'swipe-yum' : 
                  swipeDirection === 'left' ? 'swipe-yuck' : 
                  'swipe-maybe'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {swipeDirection === 'right' ? 'YUM! 😋' : 
                 swipeDirection === 'left' ? 'YUCK! 😝' : 
                 'MAYBE! 🤔'}
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
                setFilteredRestaurants(restaurants);
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

