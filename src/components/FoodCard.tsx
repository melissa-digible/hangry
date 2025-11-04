import { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Restaurant, Preference } from '../types';
import './FoodCard.css';

interface FoodCardProps {
  restaurant: Restaurant;
  onSwipe: (preference: Preference) => void;
  onDragEnd: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  zIndex: number;
}

export default function FoodCard({ restaurant, onSwipe, onDragEnd, zIndex }: FoodCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100;
    
    if (info.offset.x > threshold || info.velocity.x > 500) {
      onSwipe('yum');
    } else if (info.offset.x < -threshold || info.velocity.x < -500) {
      onSwipe('yuck');
    }
    
    onDragEnd(event, info);
  };

  return (
    <motion.div
      className="food-card"
      style={{ zIndex }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{
        opacity: 1,
        scale: isDragging ? 1.05 : 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.8,
        y: -50,
        transition: { duration: 0.3 }
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
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
        <div className="food-card-overlay">
          <div className="food-card-info">
            <h2 className="food-card-name">{restaurant.name}</h2>
            <div className="food-card-meta">
              <span className="food-card-rating">⭐ {restaurant.rating}</span>
              {restaurant.price && (
                <span className="food-card-price">{restaurant.price}</span>
              )}
              {restaurant.location && (
                <span className="food-card-location">📍 {restaurant.location}</span>
              )}
            </div>
            <div className="food-card-cuisine">
              {restaurant.cuisine.map((cuisine, index) => (
                <span key={index} className="cuisine-tag">{cuisine}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

