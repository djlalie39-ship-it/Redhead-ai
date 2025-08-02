# Overview

red.head.ai is a smart AI photo generator that learns user visual style preferences over time. The application allows users to generate custom editorial or aesthetic images with prompts and style input, save and reuse favorite styles, and includes a multi-image layout with image history and user-uploaded references. It combines the functionality of Midjourney, Pinterest, and an art director's mood board, designed to feel like an extension of the user's creative brain.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using React with TypeScript, utilizing modern React patterns and hooks. The UI is constructed with shadcn/ui components for a consistent design system, styled with Tailwind CSS. The application uses Wouter for client-side routing instead of React Router, providing a lightweight navigation solution. State management is handled through React Query (@tanstack/react-query) for server state and React's built-in state management for local component state.

The component structure follows a modular approach with reusable UI components in the `/components/ui` directory and feature-specific components in the main `/components` directory. The application supports both desktop and mobile interfaces with responsive design patterns.

## Backend Architecture

The backend is built with Express.js using TypeScript in ESM format. The server architecture follows a clean separation of concerns with dedicated files for routing, storage abstraction, and Vite integration for development. The storage layer is designed with an interface-based approach (`IStorage`) allowing for different implementations - currently featuring an in-memory storage implementation that can be easily swapped for a database-backed solution.

The API design follows RESTful conventions with endpoints for authentication, user management, style management, image generation, and history tracking. The server includes middleware for request logging and error handling.

## Data Storage Solutions

The application is configured to use PostgreSQL as the primary database through Drizzle ORM. The database schema is defined in TypeScript with tables for users, saved styles, image history, and reference uploads. The schema supports features like user preferences stored as JSONB, style usage tracking, and comprehensive image generation history.

The storage layer uses connection pooling through Neon Database (@neondatabase/serverless) for PostgreSQL connections. Database migrations are managed through Drizzle Kit with a dedicated configuration file.

## Authentication and Authorization

Authentication is currently implemented with a simplified in-memory system for demo purposes, with the architecture prepared for integration with Supabase Auth. The auth system manages user sessions, credits tracking, and user-specific data isolation. User state is persisted in localStorage for session management.

The application includes user registration and login flows with email/username support. Each user has isolated access to their generated images, saved styles, and history.

## External Dependencies

### Database Infrastructure
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database operations and schema management
- **Drizzle Kit**: Database migration and schema management tools

### UI and Styling
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography

### Development and Build Tools
- **Vite**: Fast build tool and development server with React plugin
- **TypeScript**: Type safety and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds

### Client-Side Libraries
- **React Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **Wouter**: Lightweight client-side routing
- **Zod**: Runtime type validation and schema definition

The architecture is designed to be modular and scalable, with clear separation between concerns and the ability to swap implementations (particularly for storage and authentication) as the application grows.

## AI Image Generation

The application now integrates with OpenAI's DALL-E 3 API for high-quality image generation. The system:

- Uses DALL-E 3 for professional-quality AI image generation
- Enhances prompts with style descriptions and user preferences
- Maps UI dimension ratios to DALL-E supported sizes
- Maintains the existing credit system (4 credits per generation)
- Preserves all user preferences for unlimited, free usage

## Security Measures

Security features have been implemented to protect the application infrastructure while maintaining the free, unlimited user experience:

### Rate Limiting
- General API: 1000 requests per 15 minutes (very generous)
- Image generation: 20 generations per minute
- Configured for Replit's proxy environment

### Input Validation & Sanitization
- Prompt length limited to 4000 characters (generous creative limit)
- Basic HTML tag sanitization while preserving creative content
- Username validation with alphanumeric characters and common symbols
- Email format validation

### Security Headers
- Helmet.js for common vulnerability protection
- CORS and XSS protection
- Content Security Policy configured for development

### Environment Validation
- API key validation with graceful degradation
- Error handling for missing credentials
- Logging for debugging and monitoring

All security measures are designed to protect the infrastructure without restricting user creativity or imposing usage limits. The app remains completely free with no artificial restrictions.
