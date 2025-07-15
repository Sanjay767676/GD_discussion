# AI Group Discussion Platform

## Overview

This is a real-time AI-powered Group Discussion (GD) simulation platform built with React, Express, and PostgreSQL. The platform allows users to schedule group discussion sessions with AI participants, engage in real-time conversations, and receive AI-generated feedback on their performance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS using shadcn/ui component system
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (migrated from in-memory storage)
- **API**: RESTful endpoints for session management, participant handling, and message processing
- **Real-time**: Server-sent events or WebSocket implementation for live chat functionality
- **Storage**: Database storage implementation with full CRUD operations

### AI Integration
- **Provider**: Google Gemini Pro 1.5 API for AI participant simulation and feedback generation
- **AI Personalities**: Three distinct AI participant types (confident, emotional, data-driven)
- **Features**: Real-time conversation generation and post-session feedback analysis

## Key Components

### Database Schema
- **Sessions**: Stores GD session metadata (topic, timing, participants, status)
- **Participants**: Tracks both real and AI participants with their types and personalities
- **Messages**: Real-time chat messages with speaker identification and timestamps

### Core Features
1. **Session Scheduling**: Create sessions with custom topics, timing, and participant counts
2. **Real-time Chat**: Live messaging interface with AI participant responses
3. **AI Feedback**: Post-session performance analysis and improvement suggestions
4. **Participant Management**: Handle both human and AI participants seamlessly

### UI Components
- **Session Form**: Schedule new group discussions
- **Chat Interface**: Real-time messaging with voice/text support
- **Participant List**: Display active participants with role indicators
- **Feedback Report**: Comprehensive performance analysis display

## Data Flow

1. **Session Creation**: User fills form → API creates session → AI participants auto-generated
2. **Real-time Chat**: Messages sent → Stored in database → AI responses generated → Broadcast to all participants
3. **Session Completion**: End session → Generate AI feedback → Display comprehensive report

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL for cloud database hosting
- **AI Service**: Google Gemini API for natural language processing
- **UI Components**: Radix UI primitives for accessible component foundation
- **Form Handling**: React Hook Form with Zod validation

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Drizzle**: Type-safe database operations and migrations
- **Tailwind CSS**: Utility-first styling framework
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with auto-restart
- **Database**: Local PostgreSQL or cloud Neon instance

### Production Build
- **Frontend**: Vite production build with asset optimization
- **Backend**: ESBuild bundling for Node.js deployment
- **Database**: Drizzle migrations for schema management

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Gemini API key via `GEMINI_API_KEY` environment variable
- Build and deployment scripts in package.json

The application follows a monorepo structure with shared TypeScript types and schemas, enabling type safety across the full stack while maintaining clear separation between client and server code.