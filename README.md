# YC Search Engine

A modern search engine for YCombinator opportunities with Firebase authentication and Pinecone vector search.

## Features

- 🔍 **Smart Search**: Search through curated YC content using vector embeddings
- 🔐 **Authentication**: Google sign-in required for search functionality
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI**: Glass morphic interface with smooth animations
- 📊 **Multiple Indexes**: Search across different content types:
  - AI Agents
  - Co-founder opportunities
  - Internship positions
  - Side projects
  - Startup advice
  - San Francisco activities

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mootbing/YC-AI-SUS-Search-Engine.git
   cd YC-AI-SUS-Search-Engine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Add your Firebase and Pinecone credentials

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Setup Instructions

For detailed setup instructions including Firebase and Pinecone configuration, see [SETUP.md](./SETUP.md).

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth (Google)
- **Search**: Pinecone Vector Database
- **Deployment**: Vercel

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

Created by [Jason Xu](https://jasonxu.me/contact)

---

**Note**: This project requires Firebase authentication to access the search functionality. Users will be prompted to sign in with Google when they attempt to search.