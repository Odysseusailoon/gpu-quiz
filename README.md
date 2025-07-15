# Quiz System

A simple quiz system with user authentication, scoring, and leaderboard functionality using in-memory storage, deployable on Vercel.

## Features

- User registration with username
- Multiple choice quiz questions
- Score tracking and calculation
- Leaderboard with rankings
- Simple web interface
- In-memory storage for user data and quiz results
- Vercel deployment ready

## Prerequisites

- Node.js (v14 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the application:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

The application is configured with `vercel.json` for serverless deployment.

### Local Usage

1. Open http://localhost:3000 in your browser
2. Enter your username to register
3. Answer the quiz questions
4. View your results and score
5. Check the leaderboard to see rankings

## API Endpoints

- `POST /api/register` - Register a new user
- `GET /api/questions` - Get quiz questions
- `POST /api/submit` - Submit quiz answers
- `GET /api/leaderboard` - Get leaderboard data
- `GET /api/user/:userId` - Get user information

## Storage

The system uses in-memory storage (`storage.js`) that mimics Redis functionality:
- `user:{userId}` - User data (hash)
- `quiz:{quizId}` - Quiz results (hash)
- `users` - Set of all user IDs

**Note:** Data is stored in memory and will be reset when the server restarts. For production use, consider integrating with a persistent database like MongoDB or PostgreSQL.

## Sample Questions

The system includes 5 sample questions covering general knowledge. Questions and answers are stored in memory and can be easily modified in the server.js file.