import React, { useState, useEffect } from 'react';

const RealtimeNotification = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for animation to complete
  };

  if (!notification || !isVisible) return null;

  const getNotificationStyle = () => {
    const baseStyle = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      padding: '1rem',
      borderRadius: '8px',
      color: 'white',
      minWidth: '300px',
      maxWidth: '400px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s ease-out',
      cursor: 'pointer'
    };

    // Different colors based on notification type
    switch (notification.type) {
      case 'bookAdded':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
        };
      case 'bookUpdated':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
        };
      case 'bookDeleted':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
        };
      default:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
        };
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'bookAdded':
        return '📚';
      case 'bookUpdated':
        return '✏️';
      case 'bookDeleted':
        return '🗑️';
      default:
        return '📖';
    }
  };

  const getTitle = () => {
    switch (notification.type) {
      case 'bookAdded':
        return 'New Book Added';
      case 'bookUpdated':
        return 'Book Updated';
      case 'bookDeleted':
        return 'Book Deleted';
      default:
        return 'Book Update';
    }
  };

  return (
    <div style={getNotificationStyle()} onClick={handleClose}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.2rem' }}>{getIcon()}</span>
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: 'bold', 
            marginBottom: '0.25rem',
            fontSize: '0.9rem'
          }}>
            {getTitle()}
          </div>
          
          <div style={{ 
            fontSize: '0.85rem',
            opacity: 0.95,
            lineHeight: '1.3'
          }}>
            {notification.message}
          </div>
          
          {notification.book && (
            <div style={{ 
              marginTop: '0.5rem',
              fontSize: '0.8rem',
              opacity: 0.9,
              fontStyle: 'italic'
            }}>
              "{notification.book.title}" by {notification.book.author}
            </div>
          )}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '0',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.7'}
        >
          ×
        </button>
      </div>
      
      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '3px',
        background: 'rgba(255, 255, 255, 0.3)',
        width: '100%',
        borderRadius: '0 0 8px 8px'
      }}>
        <div style={{
          height: '100%',
          background: 'rgba(255, 255, 255, 0.8)',
          width: '100%',
          borderRadius: '0 0 8px 8px',
          animation: 'shrink 4s linear forwards'
        }} />
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default RealtimeNotification;