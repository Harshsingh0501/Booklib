import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Initialize socket connection
  connect(serverUrl = 'http://localhost:5000') {
    try {
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 5
      });

      this.setupEventListeners();
      
      return this.socket;
    } catch (error) {
      console.error('Failed to connect to socket server:', error);
      throw error;
    }
  }

  // Setup basic socket event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to server:', this.socket.id);
      this.isConnected = true;
      this.notifyListeners('connectionChange', { connected: true, id: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      this.isConnected = false;
      this.notifyListeners('connectionChange', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error);
      this.isConnected = false;
      this.notifyListeners('connectionError', { error: error.message });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
      this.notifyListeners('reconnect', { attemptNumber });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Attempting to reconnect...', attemptNumber);
      this.notifyListeners('reconnectAttempt', { attemptNumber });
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔴 Reconnection error:', error);
      this.notifyListeners('reconnectError', { error: error.message });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔴 Failed to reconnect after maximum attempts');
      this.notifyListeners('reconnectFailed', {});
    });
  }

  // Add event listener
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not initialized. Call connect() first.');
      return;
    }

    // Store callback for internal management
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Add socket listener
    this.socket.on(event, callback);
  }

  // Remove event listener
  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);

    // Remove from internal management
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  // Emit event to server
  emit(event, data) {
    if (!this.socket) {
      console.warn('Socket not initialized. Call connect() first.');
      return;
    }

    if (!this.isConnected) {
      console.warn('Socket not connected. Event not sent:', event);
      return;
    }

    this.socket.emit(event, data);
  }

  // Notify internal listeners
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for event ${event}:`, error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      id: this.socket?.id || null
    };
  }

  // Manually reconnect
  reconnect() {
    if (this.socket) {
      this.socket.connect();
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('🔌 Manually disconnecting socket');
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  // Clean up all listeners and disconnect
  cleanup() {
    if (this.socket) {
      // Remove all listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
      
      this.listeners.clear();
      this.disconnect();
      this.socket = null;
    }
  }

  // Request initial data
  requestBooks() {
    this.emit('requestBooks');
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;