import { Star } from 'lucide-react';
import { useState } from 'react';

const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  size = 'medium', 
  interactive = false,
  showCount = false,
  count = 0
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6',
    xlarge: 'h-8 w-8'
  };

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => handleClick(value)}
          onMouseEnter={() => handleMouseEnter(value)}
          onMouseLeave={handleMouseLeave}
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            className={`${sizes[size]} ${
              value <= displayRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
      {showCount && count > 0 && (
        <span className="text-sm text-gray-600 ml-1">
          ({count})
        </span>
      )}
    </div>
  );
};

export default StarRating;
