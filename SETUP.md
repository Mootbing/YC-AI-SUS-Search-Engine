# YC AI SUS Search Engine Setup
Fire trust (took me 2 hours to figure out Vercel 😭😭😭)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Pinecone API Key
PINECONE_API_KEY=your_pinecone_api_key_here

# Optional: Pinecone Environment (if needed)
PINECONE_ENVIRONMENT=your_pinecone_environment_here

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
```

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and add Google as a sign-in provider
3. Get your Firebase configuration from Project Settings > General > Your apps
4. Add the configuration values to your `.env.local` file

## Pinecone Index Setup

The application expects the following Pinecone indexes to exist:

1. `ai-agents` - For AI Agents content
2. `looking-for-cofounder` - For cofounder search content
3. `looking-for-internships` - For internship opportunities
4. `side-projects` - For side project content
5. `startup-advice` - For startup advice content
6. `things-to-do-sf` - For San Francisco activities

## Vector Embedding

**Important**: The current API route includes a placeholder for vector embedding. You'll need to:

1. Implement text-to-vector embedding (e.g., using OpenAI's text-embedding-ada-002)
2. Replace the empty vector array in `/src/app/api/search/route.ts` with actual embeddings
3. Ensure your Pinecone vectors are properly indexed with metadata

## Running the Application

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## Features

- Glass morphic black search interface
- Firebase Google authentication
- Index selection for different content types
- Real-time search with loading states
- HTML-formatted results display
- Responsive design for all devices
- User profile display with sign-out functionality 