# 🚀 Vercel Deployment Guide

Complete guide to deploy your Professional MERN Blog to Vercel with MongoDB Atlas.

## 📋 Prerequisites

- GitHub account with your repository
- Vercel account (free tier)
- MongoDB Atlas account (free tier)

---

## 🗄️ Step 1: Set Up MongoDB Atlas

### 1.1 Create Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up or log in
3. Create a new project (name: "Professional Blog")

### 1.2 Create Database Cluster
1. Click "Create" under "Database"
2. Choose **M0 Sandbox** (Free tier)
3. Select a cloud provider and region (closest to you)
4. Name your cluster: `professional-blog-cluster`
5. Click "Create Cluster"

### 1.3 Set Up Database Access
1. Go to "Database Access" in the sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password (save these!)
5. Set database privileges to "Read and write to any database"
6. Click "Add User"

### 1.4 Set Up Network Access
1. Go to "Network Access" in the sidebar
2. Click "Add IP Address"
3. Choose "Allow access from anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.5 Get Connection String
1. Go back to "Database" → "Clusters"
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/`)
5. Replace `<password>` with your actual password
6. Add database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/professional-blog`

---

## 🌐 Step 2: Deploy to Vercel

### 2.1 Connect to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign up/log in with your GitHub account
3. Click "New Project"
4. Import your `blog_project` repository
5. Click "Import"

### 2.2 Configure Build Settings
Vercel should auto-detect your settings, but verify:
- **Framework Preset**: Vite
- **Build Command**: `cd packages/frontend && npm run build`
- **Output Directory**: `packages/frontend/dist`
- **Install Command**: `npm install && cd packages/frontend && npm install`

### 2.3 Set Environment Variables
Click "Environment Variables" and add these:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/professional-blog

# JWT Secrets (Generate strong secrets!)
JWT_ACCESS_SECRET=your-super-secure-access-secret-256-characters-long
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-256-characters-different

# JWT Expiry
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
NODE_ENV=production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX_REQUESTS=5
```

**🔐 Important**: Generate strong JWT secrets using a tool like:
```bash
# Run this in your terminal to generate secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.4 Deploy
1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Your app will be deployed at `https://your-project-name.vercel.app`

---

## 🔧 Step 3: Post-Deployment Configuration

### 3.1 Update CORS Settings
1. In Vercel dashboard, go to your project settings
2. Add your Vercel domain to the environment variables:
   ```env
   FRONTEND_URL=https://your-project-name.vercel.app
   ```

### 3.2 Test API Endpoints
Your API endpoints will be available at:
- `https://your-project-name.vercel.app/api/auth/register`
- `https://your-project-name.vercel.app/api/auth/login`
- `https://your-project-name.vercel.app/api/posts`
- etc.

### 3.3 Test the Application
1. Visit your deployed app
2. Try registering a new account
3. Log in with your credentials
4. Create a test blog post
5. Verify all functionality works

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. Database Connection Issues
**Error**: "MongoNetworkError" or "Authentication failed"
**Solution**:
- Check your MongoDB connection string
- Ensure password is URL-encoded (special characters need encoding)
- Verify IP whitelist includes 0.0.0.0/0

#### 2. JWT Secret Errors
**Error**: "secretOrPrivateKey has a minimum key size of 2048 bits"
**Solution**:
- Generate longer JWT secrets (64+ characters)
- Use the crypto command provided above

#### 3. CORS Errors
**Error**: "Access to fetch at '...' from origin '...' has been blocked by CORS"
**Solution**:
- Add your Vercel domain to FRONTEND_URL environment variable
- Check that CORS middleware is properly configured

#### 4. API Routes Not Found
**Error**: 404 on `/api/*` routes
**Solution**:
- Ensure `vercel.json` is in the root directory
- Check that API files are in the correct `/api` structure
- Redeploy after changes

#### 5. Build Failures
**Error**: Build fails during deployment
**Solution**:
- Check that all dependencies are listed in package.json
- Ensure TypeScript types are correctly imported
- Review build logs in Vercel dashboard

---

## 📊 Performance Optimization

### 3.1 Database Optimization
```javascript
// Add to your MongoDB connection
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
});
```

### 3.2 Caching Strategy
- Vercel automatically caches static assets
- API responses cache for 60 seconds by default
- Use `Cache-Control` headers for custom caching

---

## 🔒 Security Checklist

- [ ] Strong JWT secrets (64+ characters)
- [ ] MongoDB user has minimal required permissions
- [ ] Network access properly configured
- [ ] Environment variables set in production
- [ ] CORS configured for your domain only
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints

---

## 🚀 Going Live

### Custom Domain (Optional)
1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL certificate will be automatically generated

### Monitoring & Analytics
1. Enable Vercel Analytics in project settings
2. Set up MongoDB Atlas monitoring
3. Consider adding error tracking (Sentry, LogRocket)

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_ACCESS_SECRET` | JWT access token secret | `64-character-random-string` |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | `64-character-random-string` |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `BCRYPT_ROUNDS` | Password hash rounds | `12` |
| `NODE_ENV` | Environment | `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |

---

## 🎉 Success!

Your Professional MERN Blog is now live on Vercel! 

**🔗 Your app is available at**: `https://your-project-name.vercel.app`

### Next Steps:
1. Share your blog with the world
2. Add it to your portfolio
3. Consider adding more features
4. Monitor performance and usage

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review MongoDB Atlas logs
3. Test API endpoints individually
4. Check browser developer console for errors

**Happy Blogging!** 🚀
