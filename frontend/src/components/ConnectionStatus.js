import React from 'react';

const ConnectionStatus = ({ isConnected, isConnecting, socketId, onReconnect }) => {
  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    if (isConnected) return `Connected (${socketId})`;
    return 'Disconnected';
  };

  const getStatusClass = () => {
    if (isConnecting) return 'connecting';
    if (isConnected) return 'connected';
    return 'disconnected';
  };

  return (
    <div className="connection-status-container">
      <div className={`connection-status ${getStatusClass()}`}>
        <div className={`status-dot ${getStatusClass()}`}></div>
        <span>{getStatusText()}</span>
        
        {!isConnected && !isConnecting && (
          <button
            onClick={onReconnect}
            className="btn"
            style={{
              marginLeft: '10px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reconnect
          </button>
        )}
      </div>
      
      {isConnected && (
        <div style={{ 
          fontSize: '0.8rem', 
          color: '#666', 
          marginTop: '0.5rem',
          textAlign: 'center'
        }}>
          Real-time updates active
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;