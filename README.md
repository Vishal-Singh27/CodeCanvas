# CodeCanvas 🎨

CodeCanvas is a powerful, AI-assisted collaborative platform for developers. Seamlessly integrate your GitHub repositories, chat with an advanced AI codebase assistant, and communicate with your team in real-time.

## Features
- **GitHub Integration:** Browse repositories, branches, commits, and files with an elegant UI.
- **AI Codebase Assistant:** Select text in any file to get instant, context-aware architectural explanations and debugging help.
- **Team Collaboration:** Real-time team chat perfectly synced to your active branch's context.
- **Smart Dashboard:** Light and Dark modes with fluid glassmorphism UI.

## Project Structure
This repository is organized as a Monorepo:
- `/frontend/client` - React + Vite + TailwindCSS application.
- `/backend` - Node.js + Express API and WebSocket server.
- `/LLM` - Python-based LLM gateway (Groq/OpenAI integration).

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB instance
- GitHub OAuth App (Client ID & Secret)

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file based on environment requirements
npm start
```

### 2. Frontend Setup
```bash
cd frontend/client
npm install
# Create a .env file and set VITE_API_URL
npm run dev
```

## Deployment
This project is configured for seamless deployment:
- **Frontend:** Optimized for Vercel.
- **Backend:** Optimized for Render / DigitalOcean.
- **Database:** MongoDB Atlas.
