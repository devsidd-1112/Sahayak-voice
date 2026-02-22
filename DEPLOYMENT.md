# Deployment Guide for Sahayak-Voice

This guide provides step-by-step instructions for deploying the Sahayak-Voice application to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Git repository with your code
- MongoDB Atlas account (or self-hosted MongoDB)
- Hosting platform accounts (Heroku, Vercel, etc.)
- Domain name (optional but recommended)

## Backend Deployment

### Option 1: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   cd backend
   heroku create sahayak-voice-api
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="your-mongodb-connection-string"
   heroku config:set JWT_SECRET="your-secret-key"
   heroku config:set NODE_ENV="production"
   heroku config:set FRONTEND_URL="https://your-frontend-url.com"
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Verify Deployment**
   ```bash
   heroku logs --tail
   heroku open
   ```

### Option 2: Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize**
   ```bash
   railway login
   cd backend
   railway init
   ```

3. **Set Environment Variables**
   - Go to Railway dashboard
   - Select your project
   - Add environment variables in the Variables tab

4. **Deploy**
   ```bash
   railway up
   ```

### Option 3: Deploy to Render

1. **Create Account** at https://render.com

2. **Create New Web Service**
   - Connect your Git repository
   - Select the `backend` directory
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Set Environment Variables**
   - Add all required environment variables in the dashboard

4. **Deploy**
   - Render will automatically deploy on git push

## Frontend Deployment

### Option 1: Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add REACT_APP_API_URL
   # Enter your backend API URL when prompted
   ```

5. **Production Deployment**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy to Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Build the App**
   ```bash
   cd frontend
   npm run build
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod --dir=build
   ```

5. **Set Environment Variables**
   - Go to Netlify dashboard
   - Site settings → Build & deploy → Environment
   - Add `REACT_APP_API_URL`

### Option 3: Deploy to GitHub Pages

1. **Install gh-pages**
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/sahayak-voice",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Account** at https://www.mongodb.com/cloud/atlas

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region closest to your users
   - Create cluster

3. **Create Database User**
   - Database Access → Add New Database User
   - Choose password authentication
   - Save username and password

4. **Whitelist IP Addresses**
   - Network Access → Add IP Address
   - For development: Add your current IP
   - For production: Add `0.0.0.0/0` (allow from anywhere)

5. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `sahayak-voice`

6. **Seed Database**
   ```bash
   cd backend
   MONGODB_URI="your-connection-string" node scripts/seedData.js
   ```

## Environment Variables

### Backend Environment Variables

```bash
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sahayak-voice
JWT_SECRET=your-very-long-random-secret-key-here
PORT=5000
NODE_ENV=production

# Optional
FRONTEND_URL=https://your-frontend-domain.com
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend Environment Variables

```bash
# Required
REACT_APP_API_URL=https://your-backend-api.com/api

# Optional
REACT_APP_ENV=production
```

## Post-Deployment

### 1. Test Backend API

```bash
# Test health endpoint
curl https://your-backend-api.com/

# Test login
curl -X POST https://your-backend-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210","password":"test123"}'
```

### 2. Test Frontend

1. Open your frontend URL in a browser
2. Test login with demo credentials
3. Test voice recording (grant microphone permissions)
4. Test offline mode (disable network in DevTools)
5. Test PWA installation

### 3. Configure CORS

Ensure your backend allows requests from your frontend domain:

```javascript
// backend/server.js
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
```

### 4. Enable HTTPS

- Most hosting platforms provide HTTPS automatically
- For custom domains, configure SSL certificates
- Update all API URLs to use `https://`

### 5. Configure Service Worker

Ensure service worker is properly configured for your domain:

```javascript
// frontend/public/service-worker.js
// Update cache name with your domain
const CACHE_NAME = 'sahayak-voice-v1';
```

### 6. Test PWA Features

1. **Installability**
   - Open Chrome DevTools → Application → Manifest
   - Check for errors
   - Test "Add to Home Screen"

2. **Offline Functionality**
   - Install the PWA
   - Disable network
   - Test all features work offline

3. **Service Worker**
   - Open Chrome DevTools → Application → Service Workers
   - Verify service worker is active
   - Test cache strategies

## Monitoring and Maintenance

### 1. Set Up Logging

**Backend:**
```javascript
// Use a logging service like LogRocket, Sentry, or Datadog
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

**Frontend:**
```javascript
// Track errors in production
window.onerror = function(msg, url, lineNo, columnNo, error) {
  // Send to logging service
};
```

### 2. Monitor Performance

- Use Google Lighthouse for PWA audits
- Monitor API response times
- Track database query performance
- Set up uptime monitoring (UptimeRobot, Pingdom)

### 3. Backup Database

```bash
# MongoDB Atlas provides automatic backups
# For manual backup:
mongodump --uri="your-connection-string" --out=./backup
```

### 4. Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Audit for security vulnerabilities
npm audit
npm audit fix
```

## Troubleshooting

### Issue: CORS Errors

**Solution:**
- Check CORS configuration in backend
- Ensure FRONTEND_URL environment variable is set correctly
- Verify API URL in frontend .env file

### Issue: Service Worker Not Updating

**Solution:**
```javascript
// Force service worker update
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
```

### Issue: MongoDB Connection Fails

**Solution:**
- Check connection string format
- Verify database user credentials
- Ensure IP whitelist includes your server IP
- Check MongoDB Atlas cluster status

### Issue: JWT Token Expires Too Quickly

**Solution:**
```javascript
// Increase token expiration in backend
const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
  expiresIn: '7d' // Change from '24h' to '7d'
});
```

### Issue: Voice Input Not Working

**Solution:**
- Ensure HTTPS is enabled (required for microphone access)
- Check browser compatibility (Chrome/Edge recommended)
- Verify microphone permissions are granted

### Issue: PWA Not Installing

**Solution:**
- Check manifest.json is accessible
- Verify service worker is registered
- Ensure HTTPS is enabled
- Check for manifest errors in DevTools

## Security Checklist

- [ ] HTTPS enabled on all domains
- [ ] Environment variables properly set
- [ ] JWT secret is strong and random
- [ ] MongoDB user has minimal required permissions
- [ ] CORS configured to allow only your frontend domain
- [ ] Rate limiting enabled on API endpoints
- [ ] Input validation on all API endpoints
- [ ] Error messages don't expose sensitive information
- [ ] Dependencies are up to date
- [ ] Security headers configured (helmet.js)

## Performance Optimization

### Backend
- Enable gzip compression
- Implement caching for frequently accessed data
- Use database indexes for common queries
- Implement connection pooling

### Frontend
- Enable code splitting
- Optimize images and assets
- Implement lazy loading
- Use production build
- Enable service worker caching

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (AWS ELB, Nginx)
- Deploy multiple backend instances
- Use Redis for session management

### Database Scaling
- Implement database replication
- Use MongoDB sharding for large datasets
- Implement read replicas

### CDN
- Use CDN for static assets (Cloudflare, AWS CloudFront)
- Cache API responses where appropriate

## Rollback Plan

### Backend Rollback
```bash
# Heroku
heroku releases
heroku rollback v123

# Railway
railway rollback

# Manual
git revert <commit-hash>
git push
```

### Frontend Rollback
```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Manual
git revert <commit-hash>
npm run build
npm run deploy
```

## Support

For deployment issues:
1. Check application logs
2. Review environment variables
3. Test API endpoints manually
4. Check database connectivity
5. Verify service worker registration

---

**Remember:** Always test in a staging environment before deploying to production!
