import { useEffect, useState } from 'react';
import { Restaurant, Recipe } from '../types';
import { RecipeService } from '../services/api';
import './RestaurantModal.css';

interface RestaurantModalProps {
  restaurant: Restaurant;
  onClose: () => void;
}

interface RestaurantDetails {
  reviews?: Array<{
    id: string;
    text: string;
    rating: number;
    user: {
      name: string;
      image_url?: string;
    };
    time_created: string;
  }>;
  hours?: Array<{
    day: string;
    hours: string;
  }>;
}

export default function RestaurantModal({ restaurant, onClose }: RestaurantModalProps) {
  const [activeSection, setActiveSection] = useState<'details' | 'photos' | 'reviews' | 'recipes'>('details');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [details, setDetails] = useState<RestaurantDetails>({});
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    loadRecipes();
    loadDetails();
    console.log('Restaurant photos:', restaurant.photos?.length || 0, 'photos');
  }, [restaurant]);

  const loadRecipes = async () => {
    setLoadingRecipes(true);
    try {
      const recipeService = RecipeService.getInstance();
      const fetchedRecipes = await recipeService.getRecipesForRestaurant(
        restaurant.name,
        restaurant.cuisine
      );
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
      setRecipes([]);
    }
    setLoadingRecipes(false);
  };

  const loadDetails = async () => {
    setLoadingDetails(true);
    // Note: In a production app, you'd fetch reviews from Yelp API here
    // For now, we'll use mock data
    setDetails({
      reviews: [
        {
          id: '1',
          text: 'Amazing food and great service! Highly recommend the signature dish.',
          rating: 5,
          user: { name: 'Sarah M.' },
          time_created: '2024-10-15',
        },
        {
          id: '2',
          text: 'Good atmosphere and delicious cuisine. Will definitely come back!',
          rating: 4,
          user: { name: 'John D.' },
          time_created: '2024-10-10',
        },
        {
          id: '3',
          text: 'Best restaurant in the area. The chef really knows their craft!',
          rating: 5,
          user: { name: 'Emily R.' },
          time_created: '2024-10-08',
        },
      ],
      hours: [
        { day: 'Monday - Friday', hours: '11:00 AM - 10:00 PM' },
        { day: 'Saturday - Sunday', hours: '10:00 AM - 11:00 PM' },
      ],
    });
    setLoadingDetails(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="restaurant-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Header with main image */}
        <div className="modal-header">
          <img src={restaurant.image} alt={restaurant.name} className="modal-header-image" />
          <div className="modal-header-overlay">
            <h1 className="modal-restaurant-name">{restaurant.name}</h1>
            <div className="modal-restaurant-meta">
              <span className="modal-rating">⭐ {restaurant.rating}</span>
              {restaurant.price && <span className="modal-price">{restaurant.price}</span>}
              {restaurant.distance !== undefined && (
                <span className="modal-distance">
                  📍 {restaurant.distance < 1000 
                    ? `${Math.round(restaurant.distance)}m` 
                    : `${(restaurant.distance / 1609.34).toFixed(1)} mi`}
                </span>
              )}
            </div>
            <div className="modal-cuisine-tags">
              {restaurant.cuisine.map((cuisine, index) => (
                <span key={index} className="modal-cuisine-tag">{cuisine}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="modal-nav">
          <button
            className={`modal-nav-button ${activeSection === 'details' ? 'active' : ''}`}
            onClick={() => setActiveSection('details')}
          >
            Details
          </button>
          <button
            className={`modal-nav-button ${activeSection === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveSection('photos')}
          >
            Photos
          </button>
          <button
            className={`modal-nav-button ${activeSection === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveSection('reviews')}
          >
            Reviews
          </button>
          <button
            className={`modal-nav-button ${activeSection === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveSection('recipes')}
          >
            Make at Home ({recipes.length})
          </button>
        </div>

        {/* Content sections */}
        <div className="modal-content">
          {activeSection === 'details' && (
            <div className="modal-section">
              <h2>Restaurant Details</h2>
              
              {restaurant.location && (
                <div className="detail-group">
                  <h3>📍 Location</h3>
                  <p>{restaurant.location}</p>
                  {restaurant.url && (
                    <a href={restaurant.url} target="_blank" rel="noopener noreferrer" className="yelp-link">
                      View on Yelp →
                    </a>
                  )}
                </div>
              )}

              {!loadingDetails && details.hours && (
                <div className="detail-group">
                  <h3>🕐 Hours</h3>
                  {details.hours.map((schedule, index) => (
                    <div key={index} className="hours-row">
                      <span className="hours-day">{schedule.day}</span>
                      <span className="hours-time">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="detail-group">
                <h3>🍽️ Cuisine Types</h3>
                <div className="cuisine-list">
                  {restaurant.cuisine.map((cuisine, index) => (
                    <span key={index} className="cuisine-item">{cuisine}</span>
                  ))}
                </div>
              </div>

              <div className="detail-group">
                <h3>💰 Price Range</h3>
                <p className="price-indicator">{restaurant.price || 'Price not available'}</p>
                <p className="price-description">
                  {restaurant.price === '$' && 'Budget-friendly'}
                  {restaurant.price === '$$' && 'Moderate'}
                  {restaurant.price === '$$$' && 'Upscale'}
                  {restaurant.price === '$$$$' && 'Fine Dining'}
                </p>
              </div>
            </div>
          )}

          {activeSection === 'photos' && (
            <div className="modal-section">
              <h2>Photo Gallery</h2>
              {restaurant.photos && restaurant.photos.length > 0 ? (
                <>
                  <div className="photos-grid">
                    {restaurant.photos.map((photo, index) => (
                      <div key={index} className="photo-item">
                        <img 
                          src={photo} 
                          alt={`${restaurant.name} - Photo ${index + 1}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Photo';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  {restaurant.url && restaurant.photos.length === 1 && (
                    <div className="photos-note">
                      <p>
                        <a href={restaurant.url} target="_blank" rel="noopener noreferrer" className="yelp-link">
                          View more photos on Yelp →
                        </a>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-photos">
                  <img src={restaurant.image} alt={restaurant.name} className="single-photo" />
                  <p>
                    {restaurant.url && (
                      <a href={restaurant.url} target="_blank" rel="noopener noreferrer" className="yelp-link">
                        View photos on Yelp →
                      </a>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'reviews' && (
            <div className="modal-section">
              <h2>Customer Reviews</h2>
              {loadingDetails ? (
                <div className="loading-message">Loading reviews...</div>
              ) : details.reviews && details.reviews.length > 0 ? (
                <div className="reviews-list">
                  {details.reviews.map((review) => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <div className="review-user">
                          {review.user.image_url && (
                            <img src={review.user.image_url} alt={review.user.name} className="review-avatar" />
                          )}
                          <span className="review-username">{review.user.name}</span>
                        </div>
                        <div className="review-meta">
                          <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                          <span className="review-date">{formatDate(review.time_created)}</span>
                        </div>
                      </div>
                      <p className="review-text">{review.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No reviews available yet.</p>
                  {restaurant.url && (
                    <a href={restaurant.url} target="_blank" rel="noopener noreferrer" className="yelp-link">
                      Read reviews on Yelp →
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === 'recipes' && (
            <div className="modal-section">
              <h2>Make It at Home</h2>
              <p className="recipes-intro">
                Love this restaurant? Try these recipes inspired by {restaurant.cuisine[0]} cuisine!
              </p>
              {loadingRecipes ? (
                <div className="loading-message">Finding similar recipes...</div>
              ) : recipes.length > 0 ? (
                <div className="recipes-grid">
                  {recipes.map((recipe) => (
                    <div key={recipe.id} className="recipe-card-modal">
                      <img 
                        src={recipe.image} 
                        alt={recipe.title}
                        className="recipe-card-image-modal"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Recipe';
                        }}
                      />
                      <div className="recipe-card-content-modal">
                        <h3 className="recipe-title-modal">{recipe.title}</h3>
                        <div className="recipe-meta-modal">
                          <span>⏱️ {recipe.readyInMinutes} min</span>
                          <span>🍽️ {recipe.servings} servings</span>
                        </div>
                        {recipe.summary && (
                          <p 
                            className="recipe-summary-modal" 
                            dangerouslySetInnerHTML={{ 
                              __html: recipe.summary.substring(0, 120) + '...' 
                            }} 
                          />
                        )}
                        {recipe.sourceUrl && (
                          <a 
                            href={recipe.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="recipe-link-modal"
                          >
                            View Recipe →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No recipes found for this cuisine type.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

