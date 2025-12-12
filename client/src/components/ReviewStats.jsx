import StarRating from './StarRating';

const ReviewStats = ({ stats }) => {
  if (!stats || stats.totalReviews === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-gray-500">No reviews yet</p>
        <p className="text-sm text-gray-400 mt-1">Be the first to review this property!</p>
      </div>
    );
  }

  const { averageRating, totalReviews, distribution } = stats;

  const getPercentage = (count) => {
    return totalReviews > 0 ? ((count / totalReviews) * 100).toFixed(0) : 0;
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-6 mb-6">
        {/* Average Rating */}
        <div className="text-center">
          <p className="text-5xl font-bold text-gray-900">{averageRating}</p>
          <StarRating rating={parseFloat(averageRating)} size="medium" />
          <p className="text-sm text-gray-600 mt-1">{totalReviews} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600 w-8">{rating}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: `${getPercentage(distribution[rating] || 0)}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {distribution[rating] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;
