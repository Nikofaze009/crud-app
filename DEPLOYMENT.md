# CRUD App Deployment Guide

This guide will help you deploy your CRUD application with:
- **Frontend**: Netlify
- **Backend**: Render

## Prerequisites

1. GitHub account
2. Netlify account (free tier works)
3. Render account (free tier works)
4. MongoDB Atlas account (for database)

---

## Step 1: Setup MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with username and password
4. Get your connection string (should look like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`)
5. Whitelist all IP addresses (0.0.0.0/0) for development or add Render's IPs

---

## Step 2: Deploy Backend on Render

### 2.1 Push your code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 2.2 Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `crud-app-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Add Environment Variables:
   - Click **"Environment"** tab
   - Add these variables:
     ```
     MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/crudapp?retryWrites=true&w=majority
     PORT=5000
     NODE_ENV=production
     ```

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. Copy your Render URL (e.g., `https://crud-app-backend.onrender.com`)

**Important Notes:**
- Free tier on Render spins down after 15 minutes of inactivity
- First request after inactivity may take 30-50 seconds (cold start)
- Consider upgrading to paid tier for production use

---

## Step 3: Update Frontend Configuration

1. Open `frontend/config.js`
2. Replace `'https://your-app-name.onrender.com'` with your actual Render URL:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://crud-app-backend.onrender.com'; // ← Your actual Render URL

export default API_BASE_URL;
```

3. Commit and push the changes:

```bash
git add frontend/config.js
git commit -m "Update API URL for production"
git push
```

---

## Step 4: Deploy Frontend on Netlify

### Option A: Deploy via Netlify CLI (Recommended)

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy from project root:
```bash
netlify deploy --prod
```

4. Follow the prompts:
   - Choose "Create & configure a new site"
   - Choose your team
   - Site name: `your-app-name` (or leave blank for auto-generated)
   - Publish directory: `frontend`

### Option B: Deploy via Netlify Dashboard

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Select your repository
5. Configure build settings:
   - **Base directory**: Leave empty
   - **Build command**: Leave empty (no build needed)
   - **Publish directory**: `frontend`
6. Click **"Deploy site"**

Your site will be available at: `https://your-site-name.netlify.app`

---

## Step 5: Update Backend CORS Settings (Optional)

If you want to restrict CORS to only your Netlify domain:

1. Open `backend/server.js`
2. Update the CORS configuration:

```javascript
app.use(cors({
  origin: ['https://your-site-name.netlify.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

3. Commit and push changes (Render will auto-deploy)

---

## Step 6: Test Your Deployment

1. Visit your Netlify URL
2. Try creating a new user
3. Check the dashboard
4. Test edit and delete functionality

---

## Troubleshooting

### Backend Issues

**Problem**: "Cannot connect to database"
- Solution: Check MongoDB Atlas whitelist includes 0.0.0.0/0 or Render IPs
- Solution: Verify MONGO_URI is correct in Render environment variables

**Problem**: "Cold start takes too long"
- Solution: This is normal on free tier. First request wakes up the server (30-50 seconds)
- Solution: Use a service like UptimeRobot to ping your backend every 10 minutes

**Problem**: File uploads not working
- Solution: Render's free tier uses ephemeral filesystem - files are deleted on restart
- Solution: Use cloud storage (AWS S3, Cloudinary) for production

### Frontend Issues

**Problem**: API calls failing
- Solution: Check browser console for CORS errors
- Solution: Verify API_BASE_URL in `frontend/config.js` matches your Render URL
- Solution: Ensure your Render backend is running (not sleeping)

**Problem**: Images not loading
- Solution: Check if image URLs use the correct backend URL
- Solution: Verify uploads directory exists on Render

---

## Environment Variables Reference

### Backend (Render)
```
MONGO_URI=mongodb+srv://...
PORT=5000
NODE_ENV=production
```

### Frontend (No environment variables needed)
- API URL is configured in `frontend/config.js`

---

## Useful Commands

```bash
# Check backend logs on Render
# Go to Render Dashboard → Your Service → Logs

# Test backend API
curl https://your-backend.onrender.com/api/users

# Redeploy Netlify
netlify deploy --prod

# View Netlify logs
netlify logs
```

---

## Production Recommendations

1. **Database**: 
   - Use MongoDB Atlas shared cluster (free) or dedicated cluster
   - Enable database backups

2. **Backend**:
   - Upgrade to Render paid tier for always-on service
   - Implement proper error handling and logging
   - Add rate limiting for API endpoints
   - Use environment-specific configs

3. **File Storage**:
   - Use AWS S3 or Cloudinary for image uploads
   - Don't rely on Render's ephemeral filesystem

4. **Security**:
   - Add authentication/authorization
   - Implement proper input validation
   - Use HTTPS for all communications
   - Restrict CORS to specific domains
   - Add rate limiting

5. **Monitoring**:
   - Set up uptime monitoring (UptimeRobot, Pingdom)
   - Enable error tracking (Sentry)
   - Monitor database performance

---

## Costs

- **MongoDB Atlas**: Free tier (512 MB storage)
- **Render**: Free tier (750 hours/month, spins down after inactivity)
- **Netlify**: Free tier (100 GB bandwidth/month)

**Total Cost**: $0/month for development and small projects

---

## Need Help?

- Render Docs: https://render.com/docs
- Netlify Docs: https://docs.netlify.com
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

---

## Quick Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database connection string obtained
- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Environment variables configured on Render
- [ ] Render URL copied
- [ ] `frontend/config.js` updated with Render URL
- [ ] Frontend deployed on Netlify
- [ ] Test create, read, update, delete operations
- [ ] Verify image uploads work
- [ ] Check CORS settings

---

**Congratulations! Your CRUD app is now live!** 🎉
