import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const BookForm = ({ editingBook, onBookSaved, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publishedYear: '',
    genre: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingBook) {
      setFormData({
        title: editingBook.title || '',
        author: editingBook.author || '',
        isbn: editingBook.isbn || '',
        publishedYear: editingBook.publishedYear || '',
        genre: editingBook.genre || ''
      });
    } else {
      // Reset form for new book
      setFormData({
        title: '',
        author: '',
        isbn: '',
        publishedYear: '',
        genre: ''
      });
    }
    setErrors({});
  }, [editingBook]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    if (formData.publishedYear && (
      isNaN(formData.publishedYear) || 
      formData.publishedYear < 0 || 
      formData.publishedYear > new Date().getFullYear()
    )) {
      newErrors.publishedYear = 'Please enter a valid year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const bookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        isbn: formData.isbn.trim(),
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : null,
        genre: formData.genre.trim()
      };

      let result;
      if (editingBook) {
        // Update existing book
        result = await apiService.updateBook(editingBook.id, bookData);
        console.log('✅ Book updated successfully:', result);
      } else {
        // Add new book
        result = await apiService.addBook(bookData);
        console.log('✅ Book added successfully:', result);
      }

      // Reset form after successful submission
      if (!editingBook) {
        setFormData({
          title: '',
          author: '',
          isbn: '',
          publishedYear: '',
          genre: ''
        });
      }

      // Notify parent component
      if (onBookSaved) {
        onBookSaved(result.data, editingBook ? 'updated' : 'added');
      }

    } catch (error) {
      console.error('❌ Error saving book:', error);
      
      // Handle specific validation errors from server
      if (error.message.includes('ISBN')) {
        setErrors({ isbn: error.message });
      } else if (error.message.includes('Title')) {
        setErrors({ title: error.message });
      } else if (error.message.includes('Author')) {
        setErrors({ author: error.message });
      } else {
        // General error
        setErrors({ general: error.message || 'Failed to save book' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      publishedYear: '',
      genre: ''
    });
    setErrors({});
    
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className={`form-section ${editingBook ? 'edit-mode' : ''}`}>
      <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
      
      {errors.general && (
        <div className="error-message" style={{ marginBottom: '1rem', textAlign: 'center' }}>
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter book title"
            disabled={isSubmitting}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <div className="error-message">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="author">Author *</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Enter author name"
            disabled={isSubmitting}
            className={errors.author ? 'error' : ''}
          />
          {errors.author && <div className="error-message">{errors.author}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="isbn">ISBN</label>
          <input
            type="text"
            id="isbn"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            placeholder="Enter ISBN (optional)"
            disabled={isSubmitting}
            className={errors.isbn ? 'error' : ''}
          />
          {errors.isbn && <div className="error-message">{errors.isbn}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="publishedYear">Published Year</label>
          <input
            type="number"
            id="publishedYear"
            name="publishedYear"
            value={formData.publishedYear}
            onChange={handleChange}
            placeholder="Enter year (optional)"
            min="0"
            max={new Date().getFullYear()}
            disabled={isSubmitting}
            className={errors.publishedYear ? 'error' : ''}
          />
          {errors.publishedYear && <div className="error-message">{errors.publishedYear}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="genre">Genre</label>
          <select
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="">Select genre (optional)</option>
            <option value="Fiction">Fiction</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Mystery">Mystery</option>
            <option value="Romance">Romance</option>
            <option value="Science Fiction">Science Fiction</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Biography">Biography</option>
            <option value="History">History</option>
            <option value="Self-Help">Self-Help</option>
            <option value="Business">Business</option>
            <option value="Technology">Technology</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          {editingBook && (
            <button
              type="button"
              className="btn btn-cancel"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              editingBook ? 'Updating...' : 'Adding...'
            ) : (
              editingBook ? 'Update Book' : 'Add Book'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;