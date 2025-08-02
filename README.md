# red.head.ai - AI Photo Generator

A smart AI photo generator that learns user visual style preferences over time. Built with React, Express, and OpenAI's DALL-E 3.

## Features

- **AI Image Generation**: High-quality images using DALL-E 3
- **Style Learning**: Saves and applies user style preferences
- **Multiple Styles**: Dreamcore, Realism, Anime, Editorial
- **Flexible Dimensions**: 1:1, 4:5, 9:11, 16:9 aspect ratios
- **Image History**: Track and download all generated images
- **Style Library**: Save and reuse favorite styles
- **Free & Unlimited**: No restrictions or usage limits

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   Create a `.env` file with:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=your_database_url_here (optional)
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to `http://localhost:5000`

## Environment Setup

### OpenAI API Key
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Add it to your `.env` file as `OPENAI_API_KEY`

### Database (Optional)
The app works with in-memory storage by default. For persistent data:
1. Create a [Supabase](https://supabase.com) project
2. Get the database URL from Connection Settings
3. Add it to your `.env` file as `DATABASE_URL`

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Wouter** for routing
- **React Query** for state management

### Backend
- **Express.js** with TypeScript
- **OpenAI** for DALL-E 3 integration
- **Drizzle ORM** for database operations
- **Helmet** for security
- **Rate limiting** for protection

## Architecture

- **Frontend**: React SPA with modern hooks and components
- **Backend**: RESTful API with Express
- **Database**: PostgreSQL with Drizzle ORM (optional, defaults to in-memory)
- **AI**: OpenAI DALL-E 3 for image generation
- **Security**: Rate limiting, input validation, security headers

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/generate` - Generate images
- `GET /api/styles/:userId` - Get user styles
- `POST /api/styles` - Save new style
- `GET /api/history/:userId` - Get generation history

## Security Features

- Rate limiting (1000 requests/15min, 20 generations/min)
- Input validation and sanitization
- Security headers with Helmet.js
- Environment variable validation
- CORS and XSS protection

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Database operations (if using PostgreSQL)
npm run db:push
```

## Deployment

The app is designed for Replit deployment but works on any Node.js hosting platform:

1. Set environment variables
2. Install dependencies
3. Start with `npm run dev`

## License

This project is open source. Feel free to use and modify as needed.

## Support

For issues or questions, please refer to the code comments and documentation in the `replit.md` file.
