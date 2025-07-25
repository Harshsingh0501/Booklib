# ⚡ Quick Start Guide

Get the Real-Time Book Management App running in under 5 minutes!

## 🚀 Option 1: Automated Setup (Recommended)

### Windows Users:
```bash
# Double-click one of these files:
start-dev.bat    # For Command Prompt users
start-dev.ps1    # For PowerShell users
```

### Manual Commands:
```bash
# Clone or download the project
cd realtime-books-app

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install

# Start backend (in one terminal)
cd ../backend
npm start

# Start frontend (in another terminal)
cd ../frontend  
npm start
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🧪 Test Real-Time Features

1. Open http://localhost:3000 in **multiple browser tabs**
2. Add a book in one tab → Watch it appear in other tabs instantly! 📚
3. Edit a book in one tab → See updates in all tabs! ✏️
4. Delete a book in one tab → Watch it disappear everywhere! 🗑️

## 🔧 Troubleshooting

### Port Already in Use?
```bash
# Kill processes on ports 3000 and 5000
npx kill-port 3000 5000
```

### Connection Issues?
- Check that both servers are running
- Verify no firewall is blocking the ports
- Look for error messages in the terminal

### Dependencies Issues?
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📱 What You'll See

### Connection Status
- 🟢 **Connected**: Real-time updates active
- 🟡 **Connecting**: Attempting to connect
- 🔴 **Disconnected**: No real-time updates

### Visual Feedback
- **NEW** badge on newly added books
- **UPDATED** badge on recently modified books
- Toast notifications for all real-time events
- Smooth animations for all changes

## 🎯 Key Features to Test

- ✅ Add books with form validation
- ✅ Edit books inline
- ✅ Delete books with confirmation
- ✅ Real-time synchronization across tabs
- ✅ Connection status monitoring
- ✅ Automatic reconnection
- ✅ Responsive design (try on mobile!)

## 📚 Sample Data

The app starts with 2 sample books:
- "The Great Gatsby" by F. Scott Fitzgerald
- "To Kill a Mockingbird" by Harper Lee

## 🆘 Need Help?

- Check the full [README.md](README.md) for detailed documentation
- Review [TEST_REPORT.md](TEST_REPORT.md) for testing scenarios
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

---

**Enjoy your real-time book management experience! 📖✨**