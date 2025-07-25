import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import BookForm from './components/BookForm';
import BookCard from './components/BookCard';
import ConnectionStatus from './components/ConnectionStatus';
import RealtimeNotification from './components/RealtimeNotification';
import socketService from './services/socketService';
import apiService from './services/apiService';

function App() {
  // State management
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  
  // Socket connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [socketId, setSocketId] = useState(null);
  
  // Real-time notification state
  const [notification, setNotification] = useState(null);
  
  // Track recently added/updated books for visual feedback
  const [recentlyAddedBooks, setRecentlyAddedBooks] = useState(new Set());
  const [recentlyUpdatedBooks, setRecentlyUpdatedBooks] = useState(new Set());

  // Initialize socket connection and load initial data
  useEffect(() => {
    initializeApp();
    
    // Cleanup on unmount
    return () => {
      socketService.cleanup();
    };
  }, []);

  // Initialize the application
  const initializeApp = async () => {
    try {
      setIsConnecting(true);
      
      // Connect to socket server
      await connectToSocket();
      
      // Load initial books data
      await loadBooks();
      
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      setError('Failed to initialize application. Please refresh the page.');
    } finally {
      setLoading(false);
      setIsConnecting(false);
    }
  };

  // Connect to Socket.IO server
  const connectToSocket = async () => {
    try {
      socketService.connect();
      
      // Setup socket event listeners
      setupSocketListeners();
      
    } catch (error) {
      console.error('❌ Socket connection failed:', error);
      throw error;
    }
  };

  // Setup all socket event listeners
  const setupSocketListeners = () => {
    // Connection status events
    socketService.on('connectionChange', ({ connected, id }) => {
      setIsConnected(connected);
      setSocketId(id);
      setIsConnecting(false);
      
      if (connected) {
        console.log('✅ Socket connected successfully');
        setError(null);
      }
    });

    socketService.on('connectionError', ({ error }) => {
      setIsConnected(false);
      setIsConnecting(false);
      setError(`Connection error: ${error}`);
    });

    socketService.on('reconnectAttempt', ({ attemptNumber }) => {
      setIsConnecting(true);
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
    });

    socketService.on('reconnect', ({ attemptNumber }) => {
      setIsConnecting(false);
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      setError(null);
      // Reload books after reconnection
      loadBooks();
    });

    socketService.on('reconnectFailed', () => {
      setIsConnecting(false);
      setError('Failed to reconnect. Please refresh the page.');
    });

    // Initial books data
    socketService.on('initialBooks', (booksData) => {
      console.log('📚 Received initial books:', booksData.length);
      setBooks(booksData);
    });

    // Real-time book events
    socketService.on('bookAdded', handleBookAdded);
    socketService.on('bookUpdated', handleBookUpdated);
    socketService.on('bookDeleted', handleBookDeleted);
  };

  // Handle real-time book added event
  const handleBookAdded = useCallback((data) => {
    console.log('📚 Real-time: Book added', data);
    
    const { book, message } = data;
    
    // Add book to list if not already present
    setBooks(prevBooks => {
      const exists = prevBooks.some(b => b.id === book.id);
      if (exists) return prevBooks;
      
      return [book, ...prevBooks];
    });
    
    // Mark as recently added for visual feedback
    setRecentlyAddedBooks(prev => new Set([...prev, book.id]));
    
    // Show notification
    setNotification({
      type: 'bookAdded',
      message,
      book,
      timestamp: data.timestamp
    });
    
    // Remove visual feedback after 3 seconds
    setTimeout(() => {
      setRecentlyAddedBooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(book.id);
        return newSet;
      });
    }, 3000);
  }, []);

  // Handle real-time book updated event
  const handleBookUpdated = useCallback((data) => {
    console.log('✏️ Real-time: Book updated', data);
    
    const { book, message } = data;
    
    // Update book in list
    setBooks(prevBooks => 
      prevBooks.map(b => b.id === book.id ? book : b)
    );
    
    // Mark as recently updated for visual feedback
    setRecentlyUpdatedBooks(prev => new Set([...prev, book.id]));
    
    // Show notification
    setNotification({
      type: 'bookUpdated',
      message,
      book,
      timestamp: data.timestamp
    });
    
    // Remove visual feedback after 3 seconds
    setTimeout(() => {
      setRecentlyUpdatedBooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(book.id);
        return newSet;
      });
    }, 3000);
  }, []);

  // Handle real-time book deleted event
  const handleBookDeleted = useCallback((data) => {
    console.log('🗑️ Real-time: Book deleted', data);
    
    const { book, message } = data;
    
    // Remove book from list
    setBooks(prevBooks => prevBooks.filter(b => b.id !== book.id));
    
    // Clear from recent sets
    setRecentlyAddedBooks(prev => {
      const newSet = new Set(prev);
      newSet.delete(book.id);
      return newSet;
    });
    
    setRecentlyUpdatedBooks(prev => {
      const newSet = new Set(prev);
      newSet.delete(book.id);
      return newSet;
    });
    
    // Show notification
    setNotification({
      type: 'bookDeleted',
      message,
      book,
      timestamp: data.timestamp
    });
  }, []);

  // Load books from API
  const loadBooks = async () => {
    try {
      const response = await apiService.getBooks();
      setBooks(response.data);
      setError(null);
    } catch (error) {
      console.error('❌ Failed to load books:', error);
      setError('Failed to load books. Please try again.');
    }
  };

  // Handle book saved (added or updated)
  const handleBookSaved = (book, action) => {
    console.log(`✅ Book ${action}:`, book);
    
    if (action === 'updated') {
      // Clear editing state
      setEditingBook(null);
    }
    
    // The real-time update will handle UI updates
    // This is just for local feedback
  };

  // Handle edit book
  const handleEditBook = (book) => {
    setEditingBook(book);
    // Scroll to form
    document.querySelector('.form-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingBook(null);
  };

  // Handle delete book (called from BookCard)
  const handleDeleteBook = (bookId) => {
    // The real-time update will handle UI updates
    console.log(`🗑️ Book deleted locally: ${bookId}`);
  };

  // Handle manual reconnection
  const handleReconnect = () => {
    setIsConnecting(true);
    setError(null);
    socketService.reconnect();
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading application...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1>📚 Real-time Book Management</h1>
          <p>Add, edit, and manage your book collection with live updates</p>
          
          <ConnectionStatus
            isConnected={isConnected}
            isConnecting={isConnecting}
            socketId={socketId}
            onReconnect={handleReconnect}
          />
        </header>

        {/* Error message */}
        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #ffcdd2'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Main content */}
        <div className="main-content">
          {/* Books list */}
          <div className="books-section">
            <div className="books-header">
              <h2>Book Collection</h2>
              <div className="book-count">
                {books.length} {books.length === 1 ? 'book' : 'books'}
              </div>
            </div>

            <div className="books-grid">
              {books.length === 0 ? (
                <div className="no-books">
                  <h3>No books in your collection</h3>
                  <p>Add your first book using the form on the right!</p>
                </div>
              ) : (
                books.map(book => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onEdit={handleEditBook}
                    onDelete={handleDeleteBook}
                    isNew={recentlyAddedBooks.has(book.id)}
                    isUpdated={recentlyUpdatedBooks.has(book.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Book form */}
          <BookForm
            editingBook={editingBook}
            onBookSaved={handleBookSaved}
            onCancel={handleCancelEdit}
          />
        </div>

        {/* Real-time notification */}
        <RealtimeNotification
          notification={notification}
          onClose={handleCloseNotification}
        />
      </div>
    </div>
  );
}

export default App;