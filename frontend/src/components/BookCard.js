import React, { useState } from 'react';
import apiService from '../services/apiService';

const BookCard = ({ book, onEdit, onDelete, isNew, isUpdated }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete with confirmation
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      await apiService.deleteBook(book.id);
      console.log('✅ Book deleted successfully:', book.title);
      
      // Notify parent component
      if (onDelete) {
        onDelete(book.id);
      }
    } catch (error) {
      console.error('❌ Error deleting book:', error);
      alert(`Failed to delete book: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit
  const handleEdit = () => {
    if (onEdit) {
      onEdit(book);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get card class based on state
  const getCardClass = () => {
    let className = 'book-card';
    if (isNew) className += ' new-book';
    if (isUpdated) className += ' updated-book';
    return className;
  };

  return (
    <div className={getCardClass()}>
      {/* New/Updated indicators */}
      {isNew && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: '#4caf50',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.7rem',
          fontWeight: 'bold'
        }}>
          NEW
        </div>
      )}
      
      {isUpdated && !isNew && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: '#ff9800',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.7rem',
          fontWeight: 'bold'
        }}>
          UPDATED
        </div>
      )}

      {/* Book content */}
      <div className="book-title">{book.title}</div>
      <div className="book-author">by {book.author}</div>
      
      <div className="book-details">
        <div className="book-detail">
          <span>ISBN:</span>
          <strong>{book.isbn || 'N/A'}</strong>
        </div>
        
        <div className="book-detail">
          <span>Year:</span>
          <strong>{book.publishedYear || 'N/A'}</strong>
        </div>
        
        <div className="book-detail">
          <span>Genre:</span>
          <strong>{book.genre || 'N/A'}</strong>
        </div>
        
        <div className="book-detail">
          <span>Added:</span>
          <strong>{formatDate(book.createdAt)}</strong>
        </div>
        
        {book.updatedAt !== book.createdAt && (
          <div className="book-detail">
            <span>Updated:</span>
            <strong>{formatDate(book.updatedAt)}</strong>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="book-actions">
        <button
          className="btn btn-edit"
          onClick={handleEdit}
          disabled={isDeleting}
          title="Edit book"
        >
          ✏️ Edit
        </button>
        
        <button
          className="btn btn-delete"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete book"
        >
          {isDeleting ? '⏳ Deleting...' : '🗑️ Delete'}
        </button>
      </div>
    </div>
  );
};

export default BookCard;