# 🚀 Deployment Guide - Real-Time Book Management App

This guide covers deploying the Real-Time Book Management Application to various cloud platforms.

## 📋 Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] Environment variables configured
- [ ] CORS settings updated for production URLs
- [ ] Database connection configured (if using external DB)
- [ ] SSL certificates ready (for HTTPS)
- [ ] Domain names configured

## 🖥️ Backend Deployment

### Option 1: Render (Recommended)

1. **Create Render Account**: Sign up at [render.com](https://render.com)

2. **Connect Repository**: 
   - Link your GitHub repository
   - Select the `backend` folder as root directory

3. **Configure Service**:
   ```yaml
   # render.yaml (place in backend folder)
   services:
     - type: web
       name: books-api
       env: node
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           fromService: true
         - key: FRONTEND_URL
           value: https://your-frontend-domain.vercel.app
   ```

4. **Environment Variables**:
   ```bash
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   PORT=10000  # Render assigns this automatically
   ```

5. **Deploy**: Push to main branch, Render auto-deploys

### Option 2: Heroku

1. **Install Heroku CLI**: Download from [heroku.com](https://heroku.com)

2. **Login and Create App**:
   ```bash
   heroku login
   heroku create your-books-api
   ```

3. **Configure Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

4. **Deploy**:
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a your-books-api
   git push heroku main
   ```

### Option 3: Railway

1. **Create Railway Account**: Sign up at [railway.app](https://railway.app)

2. **Deploy from GitHub**:
   - Connect repository
   - Select backend folder
   - Railway auto-detects Node.js

3. **Environment Variables**:
   ```bash
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Configure Environment Variables**:
   Create `.env.production` in frontend folder:
   ```bash
   REACT_APP_API_URL=https://your-backend-domain.render.com/api
   REACT_APP_SOCKET_URL=https://your-backend-domain.render.com
   ```

3. **Deploy**:
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Configure Domain** (Optional):
   - Add custom domain in Vercel dashboard
   - Update DNS records

### Option 2: Netlify

1. **Build the App**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy via Drag & Drop**:
   - Go to [netlify.com](https://netlify.com)
   - Drag `build` folder to deploy area

3. **Configure Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add:
     ```bash
     REACT_APP_API_URL=https://your-backend-domain.render.com/api
     REACT_APP_SOCKET_URL=https://your-backend-domain.render.com
     ```

4. **Redeploy**: Trigger new deployment after env vars

### Option 3: GitHub Pages

1. **Install gh-pages**:
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

2. **Update package.json**:
   ```json
   {
     "homepage": "https://yourusername.github.io/realtime-books-app",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

## 🔧 Production Configuration

### Backend Production Updates

Update `server.js` for production:

```javascript
// Add at the top
require('dotenv').config();

// Update CORS configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Update port configuration
const PORT = process.env.PORT || 5000;
```

### Frontend Production Updates

Update `socketService.js`:

```javascript
connect(serverUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000') {
  // ... existing code
}
```

Update `apiService.js`:

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  // ... existing config
});
```

## 🔒 Security Considerations

### 1. Environment Variables
Never commit sensitive data to version control:

```bash
# Backend .env
NODE_ENV=production
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com

# Frontend .env
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_SOCKET_URL=https://your-backend-domain.com
```

### 2. CORS Configuration
Restrict CORS to your specific domains:

```javascript
const allowedOrigins = [
  'https://your-frontend-domain.vercel.app',
  'https://your-custom-domain.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### 3. Rate Limiting
Add rate limiting to prevent abuse:

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

### 4. Helmet for Security Headers
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

## 📊 Monitoring & Logging

### 1. Add Logging
```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 2. Health Check Endpoint
Already implemented in `/api/health`:

```javascript
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    connectedClients: io.engine.clientsCount
  });
});
```

### 3. Error Tracking
Consider integrating with services like:
- Sentry
- LogRocket
- Bugsnag

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install backend dependencies
        run: |
          cd backend
          npm install
      
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm install
      
      - name: Run tests
        run: |
          cd frontend
          npm test -- --coverage --watchAll=false

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        # Add your deployment steps here

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

## 🌍 Custom Domain Setup

### 1. Backend Domain
- Configure DNS A record to point to your server IP
- Set up SSL certificate (Let's Encrypt recommended)
- Update CORS settings with new domain

### 2. Frontend Domain
- Most platforms (Vercel, Netlify) provide automatic SSL
- Configure DNS CNAME to point to platform's domain
- Update environment variables with new API URL

## 📈 Scaling Considerations

### 1. Database
Replace in-memory storage with:
- **MongoDB Atlas** (recommended for document storage)
- **PostgreSQL** (for relational data)
- **Redis** (for session storage and caching)

### 2. Socket.IO Scaling
For multiple server instances:

```bash
npm install @socket.io/redis-adapter redis
```

```javascript
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

### 3. Load Balancing
Configure load balancer with sticky sessions for Socket.IO:

```nginx
upstream backend {
    ip_hash;  # Sticky sessions
    server backend1.example.com;
    server backend2.example.com;
}
```

## 🔍 Troubleshooting

### Common Deployment Issues

1. **CORS Errors**:
   - Check origin URLs in CORS configuration
   - Ensure HTTPS is used in production

2. **Socket.IO Connection Fails**:
   - Verify WebSocket support on hosting platform
   - Check firewall settings
   - Enable sticky sessions for load balancers

3. **Environment Variables Not Loading**:
   - Verify variable names match exactly
   - Check platform-specific env var syntax
   - Restart services after changes

4. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Clear npm cache: `npm cache clean --force`

### Debugging Commands

```bash
# Check environment variables
echo $NODE_ENV

# Test API endpoints
curl https://your-api-domain.com/api/health

# Check Socket.IO connection
# Use browser dev tools → Network → WS tab
```

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Test locally with production environment variables
4. Contact platform support if needed

---

**Happy Deploying! 🚀**