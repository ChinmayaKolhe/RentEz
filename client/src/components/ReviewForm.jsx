import { useState } from 'react';
import StarRating from './StarRating';
import { X, Upload } from 'lucide-react';

const ReviewForm = ({ onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    pros: [''],
    cons: [''],
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  const handleRatingChange = (rating) => {
    setFormData({ ...formData, rating });
    if (errors.rating) {
      setErrors({ ...errors, rating: '' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleArrayChange = (type, index, value) => {
    const newArray = [...formData[type]];
    newArray[index] = value;
    setFormData({ ...formData, [type]: newArray });
  };

  const addArrayItem = (type) => {
    if (formData[type].length < 5) {
      setFormData({ ...formData, [type]: [...formData[type], ''] });
    }
  };

  const removeArrayItem = (type, index) => {
    const newArray = formData[type].filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: newArray.length > 0 ? newArray : [''] });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setErrors({ ...errors, images: 'Maximum 5 images allowed' });
      return;
    }

    setImages([...images, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    if (formData.comment.trim().length < 20) {
      newErrors.comment = 'Comment must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = new FormData();
      submitData.append('rating', formData.rating);
      submitData.append('title', formData.title);
      submitData.append('comment', formData.comment);
      
      // Filter out empty pros/cons
      const filteredPros = formData.pros.filter(p => p.trim());
      const filteredCons = formData.cons.filter(c => c.trim());
      
      filteredPros.forEach(pro => submitData.append('pros[]', pro));
      filteredCons.forEach(con => submitData.append('cons[]', con));
      
      images.forEach(image => submitData.append('images', image));

      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        <StarRating
          rating={formData.rating}
          onRatingChange={handleRatingChange}
          interactive={true}
          size="large"
        />
        {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Review Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          maxLength={100}
          className="input-field"
          placeholder="Brief title (min 5 chars)"
        />
        <div className="flex justify-between mt-1">
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          <p className="text-sm text-gray-500 ml-auto">{formData.title.length}/100</p>
        </div>
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review *
        </label>
        <textarea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          rows={5}
          maxLength={1000}
          className="input-field"
          placeholder="Your review (min 20 chars)"
        />
        <div className="flex justify-between mt-1">
          {errors.comment && <p className="text-red-500 text-sm">{errors.comment}</p>}
          <p className="text-sm text-gray-500 ml-auto">{formData.comment.length}/1000</p>
        </div>
      </div>

      {/* Pros */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pros (Optional)
        </label>
        {formData.pros.map((pro, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={pro}
              onChange={(e) => handleArrayChange('pros', index, e.target.value)}
              className="input-field"
              placeholder="What did you like?"
            />
            {formData.pros.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('pros', index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
        {formData.pros.length < 5 && (
          <button
            type="button"
            onClick={() => addArrayItem('pros')}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            + Add another pro
          </button>
        )}
      </div>

      {/* Cons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cons (Optional)
        </label>
        {formData.cons.map((con, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={con}
              onChange={(e) => handleArrayChange('cons', index, e.target.value)}
              className="input-field"
              placeholder="What could be improved?"
            />
            {formData.cons.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('cons', index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
        {formData.cons.length < 5 && (
          <button
            type="button"
            onClick={() => addArrayItem('cons')}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            + Add another con
          </button>
        )}
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos (Optional, max 5)
        </label>
        <div className="flex flex-wrap gap-3">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="h-24 w-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <Upload className="h-6 w-6 text-gray-400" />
            </label>
          )}
        </div>
        {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
