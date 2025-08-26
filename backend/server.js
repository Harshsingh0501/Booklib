const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// CORS allowlist for both Express and Socket.IO
const allowedOrigins = [
  'http://localhost:3000',
  'https://my-frontend.onrender.com',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// Configure Socket.IO with CORS using the same allowlist
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  },
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// In-memory book storage (replace with database in production)
let books = [
  {
    id: uuidv4(),
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0-7432-7356-5",
    publishedYear: 1925,
    genre: "Fiction",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0-06-112008-4",
    publishedYear: 1960,
    genre: "Fiction",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Send current books to newly connected client
  socket.emit('initialBooks', books);
  
  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
  
  // Handle custom events from client (optional)
  socket.on('requestBooks', () => {
    socket.emit('initialBooks', books);
  });
});

// API Routes

// Get all books
app.get('/api/books', (req, res) => {
  res.json({
    success: true,
    data: books,
    count: books.length
  });
});

// Get single book by ID
app.get('/api/books/:id', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }
  
  res.json({
    success: true,
    data: book
  });
});

// Add new book
app.post('/api/books', (req, res) => {
  try {
    const { title, author, isbn, publishedYear, genre } = req.body;
    
    // Basic validation
    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: 'Title and author are required'
      });
    }
    
    // Check if ISBN already exists
    if (isbn && books.some(book => book.isbn === isbn)) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }
    
    const newBook = {
      id: uuidv4(),
      title,
      author,
      isbn: isbn || '',
      publishedYear: publishedYear || null,
      genre: genre || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    books.push(newBook);
    
    // Emit real-time event to all connected clients
    io.emit('bookAdded', {
      book: newBook,
      message: `New book "${title}" has been added`,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Book added: ${title} by ${author} - Broadcasting to ${io.engine.clientsCount} clients`);
    
    res.status(201).json({
      success: true,
      data: newBook,
      message: 'Book added successfully'
    });
    
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update book
app.put('/api/books/:id', (req, res) => {
  try {
    const bookIndex = books.findIndex(b => b.id === req.params.id);
    
    if (bookIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    const { title, author, isbn, publishedYear, genre } = req.body;
    
    // Basic validation
    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: 'Title and author are required'
      });
    }
    
    // Check if ISBN already exists (excluding current book)
    if (isbn && books.some(book => book.isbn === isbn && book.id !== req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }
    
    const oldBook = { ...books[bookIndex] };
    
    // Update book
    books[bookIndex] = {
      ...books[bookIndex],
      title,
      author,
      isbn: isbn || '',
      publishedYear: publishedYear || null,
      genre: genre || '',
      updatedAt: new Date().toISOString()
    };
    
    const updatedBook = books[bookIndex];
    
    // Emit real-time event to all connected clients
    io.emit('bookUpdated', {
      book: updatedBook,
      oldBook: oldBook,
      message: `Book "${title}" has been updated`,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Book updated: ${title} by ${author} - Broadcasting to ${io.engine.clientsCount} clients`);
    
    res.json({
      success: true,
      data: updatedBook,
      message: 'Book updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete book
app.delete('/api/books/:id', (req, res) => {
  try {
    const bookIndex = books.findIndex(b => b.id === req.params.id);
    
    if (bookIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    const deletedBook = books[bookIndex];
    books.splice(bookIndex, 1);
    
    // Emit real-time event to all connected clients
    io.emit('bookDeleted', {
      book: deletedBook,
      message: `Book "${deletedBook.title}" has been deleted`,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Book deleted: ${deletedBook.title} - Broadcasting to ${io.engine.clientsCount} clients`);
    
    res.json({
      success: true,
      data: deletedBook,
      message: 'Book deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    connectedClients: io.engine.clientsCount
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Book Management API available at http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.IO server ready for real-time connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});