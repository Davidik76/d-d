# Development Guide

This guide covers setting up the development environment for the Yandex Music Service.

## Prerequisites

- Node.js 18+ 
- Python 3.8+
- Git
- Code editor (VS Code recommended)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yandex-music-service
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your values
   
   # Frontend
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your values
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   pip install -r python/requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## Project Structure

```
yandex-music-service/
├── backend/
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   ├── python/          # Python scripts for Yandex Music API
│   ├── supabase/        # Database schema
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── hooks/       # Custom hooks
│   └── public/          # Static assets
└── docs/               # Documentation
```

## Environment Variables

### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
YANDEX_MUSIC_TOKEN=your_yandex_music_token
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3001
```

## Getting API Keys

### Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get URL and keys from Settings > API

### Yandex Music
1. Go to [Yandex Music](https://music.yandex.ru)
2. Sign in with your account
3. Get token from browser developer tools (Network tab)
4. Or use the official API documentation

## Development Workflow

### Backend Development

1. **API Routes**: Add new routes in `backend/routes/`
2. **Services**: Business logic in `backend/services/`
3. **Middleware**: Custom middleware in `backend/middleware/`
4. **Database**: Schema changes in `backend/supabase/schema.sql`

### Frontend Development

1. **Components**: Reusable components in `src/components/`
2. **Pages**: Page components in `src/pages/`
3. **Contexts**: State management in `src/contexts/`
4. **Services**: API calls in `src/services/`

### Styling

- Uses Tailwind CSS for styling
- Custom styles in `src/index.css`
- Component-specific styles with Tailwind classes
- Dark theme by default

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## Code Quality

### ESLint
```bash
# Frontend
cd frontend
npm run lint
```

### Prettier
```bash
# Format code
npx prettier --write .
```

## Database Development

### Local Supabase (Optional)
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db push
```

### Schema Changes
1. Modify `backend/supabase/schema.sql`
2. Apply changes to your Supabase project
3. Update any related code

## API Development

### Adding New Endpoints

1. Create route file in `backend/routes/`
2. Add middleware if needed
3. Update `backend/server.js` to include the route
4. Test with Postman or curl

### Example Route
```javascript
// backend/routes/example.js
const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Hello World' });
});

module.exports = router;
```

## Frontend Development

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation in `src/components/Layout.jsx`

### State Management

- Uses React Context for global state
- React Query for server state
- Local state with useState/useReducer

### Component Guidelines

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for better type safety
- Follow naming conventions

## Debugging

### Backend Debugging
- Use `console.log()` for debugging
- Check server logs in terminal
- Use Postman for API testing

### Frontend Debugging
- Use React Developer Tools
- Browser DevTools
- Console logging
- Network tab for API calls

## Performance Optimization

### Backend
- Implement caching with Redis
- Optimize database queries
- Use compression middleware
- Implement rate limiting

### Frontend
- Lazy load components
- Optimize images
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

## Security Considerations

### Backend
- Validate all inputs
- Use environment variables for secrets
- Implement proper authentication
- Add rate limiting
- Use HTTPS in production

### Frontend
- Sanitize user inputs
- Use HTTPS
- Implement proper error handling
- Don't expose sensitive data

## Common Issues

### CORS Errors
- Check CORS_ORIGIN in backend .env
- Ensure frontend URL is correct

### Authentication Issues
- Verify Supabase configuration
- Check token validity
- Ensure proper error handling

### API Errors
- Check Yandex Music token
- Verify API endpoints
- Check network connectivity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Resources

- [React Documentation](https://reactjs.org/docs)
- [Express.js Documentation](https://expressjs.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Yandex Music API](https://yandex-music.readthedocs.io)