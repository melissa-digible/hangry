import { useState } from 'react';
import { FilterPreferences } from '../types';
import './PreferencesScreen.css';

interface PreferencesScreenProps {
  onStart: (preferences: FilterPreferences, maxDistance: number) => void;
  userLocation: { latitude: number; longitude: number } | null;
  locationError: string | null;
  onRefreshLocation: () => void;
}

const COMMON_CATEGORIES = [
  'Coffee & Tea',
  'Fast Food',
  'Bars',
  'Breakfast & Brunch',
  'Bakeries',
  'Desserts',
  'Food Trucks',
  'Cafes',
  'Buffets',
  'Delis'
];

const PRICE_LEVELS = [
  { value: '$', label: '$ - Inexpensive', description: 'Under $10' },
  { value: '$$', label: '$$ - Moderate', description: '$11-30' },
  { value: '$$$', label: '$$$ - Pricey', description: '$31-60' },
  { value: '$$$$', label: '$$$$ - Ultra High-End', description: '$61+' }
];

export default function PreferencesScreen({ 
  onStart, 
  userLocation, 
  locationError, 
  onRefreshLocation 
}: PreferencesScreenProps) {
  const [excludedCategories, setExcludedCategories] = useState<string[]>([]);
  const [openNow, setOpenNow] = useState(false);
  const [priceRange, setPriceRange] = useState<string[]>(['$', '$$', '$$$', '$$$$']);
  const [maxDistance, setMaxDistance] = useState(10); // miles

  const toggleCategory = (category: string) => {
    setExcludedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const togglePrice = (price: string) => {
    setPriceRange(prev => 
      prev.includes(price)
        ? prev.filter(p => p !== price)
        : [...prev, price].sort((a, b) => a.length - b.length)
    );
  };

  const handleStart = () => {
    // Ensure at least one price level is selected
    const finalPriceRange = priceRange.length > 0 ? priceRange : ['$', '$$', '$$$', '$$$$'];
    
    onStart(
      {
        excludedCategories,
        openNow,
        priceRange: finalPriceRange
      },
      maxDistance
    );
  };

  return (
    <div className="preferences-screen">
      <div className="preferences-container">
        <h1 className="preferences-title">🍽️ Set Your Preferences</h1>
        <p className="preferences-subtitle">Let's customize your restaurant search</p>

        {/* Location Section */}
        <div className="preferences-section">
          <h2 className="section-title">📍 Location & Distance</h2>
          <div className="section-content">
            {locationError ? (
              <div className="location-status location-warning">
                <span>⚠️ {locationError}</span>
              </div>
            ) : userLocation ? (
              <div className="location-status location-success">
                <span>✓ Using your current location</span>
              </div>
            ) : (
              <div className="location-status">
                <span>📍 Getting your location...</span>
              </div>
            )}
            
            <button 
              className="refresh-location-button"
              onClick={onRefreshLocation}
            >
              🔄 Refresh Location
            </button>

            <div className="distance-control">
              <label className="distance-label">
                <span className="distance-text">Maximum Distance: {maxDistance} miles</span>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                  className="distance-slider"
                />
                <div className="distance-markers">
                  <span>1 mi</span>
                  <span>15 mi</span>
                  <span>30 mi</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Price Range Section */}
        <div className="preferences-section">
          <h2 className="section-title">💰 Price Range</h2>
          <p className="section-description">Select price levels you're comfortable with</p>
          <div className="section-content">
            <div className="price-grid">
              {PRICE_LEVELS.map(price => (
                <button
                  key={price.value}
                  className={`price-option ${priceRange.includes(price.value) ? 'selected' : ''}`}
                  onClick={() => togglePrice(price.value)}
                >
                  <div className="price-symbol">{price.value}</div>
                  <div className="price-label">{price.label}</div>
                  <div className="price-description">{price.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Open Now Section */}
        <div className="preferences-section">
          <h2 className="section-title">🕐 Availability</h2>
          <div className="section-content">
            <label className="toggle-option">
              <input
                type="checkbox"
                checked={openNow}
                onChange={(e) => setOpenNow(e.target.checked)}
              />
              <span className="toggle-label">
                <span className="toggle-icon">✓</span>
                <span>Only show restaurants open now</span>
              </span>
            </label>
          </div>
        </div>

        {/* Exclude Categories Section */}
        <div className="preferences-section">
          <h2 className="section-title">🚫 Exclude Categories</h2>
          <p className="section-description">Don't show me these types of places</p>
          <div className="section-content">
            <div className="categories-grid">
              {COMMON_CATEGORIES.map(category => (
                <button
                  key={category}
                  className={`category-option ${excludedCategories.includes(category) ? 'excluded' : ''}`}
                  onClick={() => toggleCategory(category)}
                >
                  <span className="category-icon">
                    {excludedCategories.includes(category) ? '✗' : '○'}
                  </span>
                  <span>{category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button 
          className="start-button"
          onClick={handleStart}
        >
          Start Swiping! 🚀
        </button>

        <p className="preferences-note">
          You can adjust these settings anytime from the main screen
        </p>
      </div>
    </div>
  );
}

