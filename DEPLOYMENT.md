# Deployment Guide

This guide covers deploying the Yandex Music Service to production.

## Prerequisites

- Node.js 18+ installed
- Python 3.8+ installed
- Supabase account
- Yandex Music API token
- Vercel account (for frontend)
- Render/Heroku account (for backend)

## 1. Supabase Setup

### Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Note down your project URL and anon key
3. Go to Settings > API to get your service role key

### Database Setup

1. Go to SQL Editor in Supabase
2. Run the SQL script from `backend/supabase/schema.sql`
3. This will create all necessary tables and policies

### Authentication Setup

1. Go to Authentication > Settings
2. Enable email authentication
3. Configure Google OAuth (optional):
   - Add your domain to allowed origins
   - Configure OAuth providers

## 2. Backend Deployment (Render/Heroku)

### Using Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Configure build settings:
   - Build Command: `cd backend && npm install && pip install -r python/requirements.txt`
   - Start Command: `cd backend && npm start`
4. Set environment variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   YANDEX_MUSIC_TOKEN=your_yandex_music_token
   NODE_ENV=production
   PORT=10000
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

### Using Heroku

1. Install Heroku CLI
2. Create a new app: `heroku create your-app-name`
3. Add Python buildpack: `heroku buildpacks:add heroku/python`
4. Add Node.js buildpack: `heroku buildpacks:add heroku/nodejs`
5. Set environment variables:
   ```bash
   heroku config:set SUPABASE_URL=your_supabase_url
   heroku config:set SUPABASE_SERVICE_KEY=your_supabase_service_key
   heroku config:set YANDEX_MUSIC_TOKEN=your_yandex_music_token
   heroku config:set NODE_ENV=production
   heroku config:set CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```
6. Deploy: `git push heroku main`

## 3. Frontend Deployment (Vercel)

### Using Vercel CLI

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend directory: `cd frontend`
3. Run: `vercel`
4. Follow the prompts to configure your project
5. Set environment variables in Vercel dashboard:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=https://your-backend-domain.onrender.com
   ```

### Using Vercel Dashboard

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Set root directory to `frontend`
4. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Set environment variables in project settings

## 4. Domain Configuration

### Custom Domain (Optional)

1. In Vercel, go to your project settings
2. Add your custom domain
3. Update CORS_ORIGIN in backend environment variables
4. Update Supabase allowed origins

## 5. Environment Variables Summary

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
YANDEX_MUSIC_TOKEN=your_yandex_music_token
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://your-backend-domain.onrender.com
```

## 6. Post-Deployment Checklist

- [ ] Backend is accessible and returns health check
- [ ] Frontend loads without errors
- [ ] Authentication works (sign up/sign in)
- [ ] Music search functionality works
- [ ] Player can load and play tracks
- [ ] Favorites can be added/removed
- [ ] Playlists can be created and managed
- [ ] All API endpoints respond correctly

## 7. Monitoring and Maintenance

### Health Checks

- Backend: `GET /health`
- Monitor logs in your hosting platform
- Set up uptime monitoring (UptimeRobot, etc.)

### Performance Optimization

- Enable CDN for static assets
- Implement Redis caching for API responses
- Monitor API rate limits
- Optimize database queries

### Security

- Regularly update dependencies
- Monitor for security vulnerabilities
- Use HTTPS everywhere
- Implement rate limiting
- Monitor API usage

## 8. Troubleshooting

### Common Issues

1. **CORS Errors**: Check CORS_ORIGIN environment variable
2. **Authentication Issues**: Verify Supabase configuration
3. **API Errors**: Check Yandex Music token validity
4. **Build Failures**: Ensure all dependencies are installed

### Debug Mode

Set `NODE_ENV=development` to enable detailed error messages.

## 9. Scaling Considerations

- Use Redis for session storage and caching
- Implement database connection pooling
- Consider using a CDN for static assets
- Monitor memory usage and optimize accordingly
- Implement proper logging and monitoring

## 10. Backup Strategy

- Regular database backups via Supabase
- Code repository backups
- Environment variable backups
- Document configuration changes