# 🚀 Vercel Deployment Guide

## Prerequisites

1. **MongoDB Atlas Account** (free tier available)
2. **Vercel Account** (free tier available)
3. **Gemini API Key** from Google AI Studio

## Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Vercel
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/project_catalyst`

## Step 2: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key (starts with `AIzaSy...`)

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI
vercel env add GEMINI_API_KEY
vercel env add NODE_ENV

# Redeploy with environment variables
vercel --prod
```

### Option B: Deploy via GitHub

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `GEMINI_API_KEY`: Your Gemini API key
   - `NODE_ENV`: `production`
6. Deploy

## Step 4: Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/project_catalyst
GEMINI_API_KEY = AIzaSy...your_key_here
NODE_ENV = production
```

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Test project creation
3. Test AI chat functionality
4. Verify data persistence

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Check connection string format
   - Verify IP whitelist includes 0.0.0.0/0
   - Ensure database user has read/write permissions

2. **API Key Error**
   - Verify Gemini API key is correct
   - Check API key has proper permissions
   - Ensure environment variable is set correctly

3. **Build Errors**
   - Check all dependencies are in package.json
   - Verify TypeScript types are correct
   - Review build logs in Vercel dashboard

### Performance Optimization:

1. **Database Indexing** (already configured in models)
2. **API Response Caching** (handled by Vercel)
3. **Static Asset Optimization** (handled by Vite + Vercel)

## Features Available in Production:

✅ **Full AI Chat System** - All 3 bots working
✅ **Project Management** - CRUD operations
✅ **Chat History** - Persistent across sessions
✅ **Responsive Design** - Works on all devices
✅ **Secure API Keys** - Server-side only
✅ **Auto-scaling** - Handled by Vercel
✅ **Global CDN** - Fast worldwide access

## Cost Estimation:

- **Vercel**: Free tier (up to 100GB bandwidth)
- **MongoDB Atlas**: Free tier (512MB storage)
- **Gemini API**: Pay-per-use (very affordable)

**Total Monthly Cost**: $0-5 for small to medium usage

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Monitor MongoDB Atlas metrics
3. Review browser console for client errors
4. Check API endpoint responses

Your Project Catalyst app is now ready for production! 🎉