# ISHEBOT - Intelligent Student Holistic Evaluation & Behavior Optimization Tool

> AI-powered student analysis dashboard with multi-language support and intelligent classroom optimization

## 📖 Overview

ISHEBOT is a comprehensive student analysis and classroom management platform that helps teachers:
- Analyze student learning styles and behaviors using AI
- Generate personalized educational recommendations
- Optimize classroom seating arrangements
- Track student progress across multiple dimensions
- Support multilingual education (Hebrew, English, Arabic, Russian)

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7
- **UI Library**: TailwindCSS + Framer Motion
- **State Management**: React Query + Context API
- **Routing**: React Router v6
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Hosting**: Vercel

### Backend
- **Framework**: Python FastAPI
- **Optimization Engine**: DEAP (Genetic Algorithms)
- **Hosting**: Railway/Render
- **API Docs**: Swagger/ReDoc auto-generated

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Python >= 3.9 (for backend)
- Firebase project (see setup guide)

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd newdashboard-5
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   Open http://localhost:5173

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   ```

5. **Run backend server**
   ```bash
   uvicorn app.main:app --reload
   ```

   API docs: http://localhost:8000/docs

## 📦 Project Structure

```
newdashboard-5/
├── src/
│   ├── components/        # React components
│   │   ├── dashboard/     # Dashboard views
│   │   ├── forms/         # Student assessment forms
│   │   ├── auth/          # Authentication components
│   │   └── ui/            # Reusable UI components
│   ├── services/          # API and business logic
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── i18n/              # Internationalization
│   ├── security/          # Security utilities
│   ├── config/            # Configuration files
│   └── pages/             # Page components
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Core config
│   │   ├── models/       # Data models
│   │   └── services/     # Business logic
│   └── requirements.txt
├── public/               # Static assets
├── docs/                 # Documentation
├── firestore.rules       # Database security rules
└── vercel.json          # Deployment config
```

## 🔐 Security Features

- ✅ Firebase Authentication (Email/Password, Google OAuth)
- ✅ Role-based access control (Teacher, Admin, Student)
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Bot detection
- ✅ Data encryption
- ✅ Secure Firebase rules
- ✅ Content Security Policy (CSP)
- ✅ XSS protection

## 🌍 Internationalization

Supported languages:
- 🇮🇱 Hebrew (עברית) - Default, RTL
- 🇬🇧 English
- 🇸🇦 Arabic (العربية) - RTL
- 🇷🇺 Russian (Русский)

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run e2e

# Run accessibility tests
npm run a11y
```

## 📊 Build & Deploy

### Production Build

```bash
# Frontend
npm run build

# Backend
docker build -t ishebot-backend ./backend
```

### Deploy to Vercel (Frontend)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set environment variables** in Vercel Dashboard

See `docs/VERCEL_DEPLOYMENT_SETUP.md` for detailed instructions.

### Deploy Backend to Railway

See `docs/DOCKER_DEPLOYMENT_GUIDE.md` for detailed instructions.

## 🔧 Environment Variables

### Required Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | `AIza...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `my-project` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | `1:123:web:abc` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_USE_MOCK_DATA` | Use mock data instead of Firebase | `false` |
| `VITE_OPTIMIZATION_API_URL` | Backend optimization API URL | `http://localhost:8000` |
| `VITE_ENABLE_AI_ANALYSIS` | Enable AI features | `true` |

See `.env.example` for complete list.

## 📚 Documentation

- [Firebase Setup Guide](docs/FIREBASE_SETUP_GUIDE.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Security Setup](docs/FIREBASE_SECURITY_SETUP.md)
- [User Guide](USER_GUIDE.md)
- [API Documentation](http://localhost:8000/docs) (when backend running)

## 🐛 Troubleshooting

### Common Issues

**Firebase not configured error**
```
⚠️ Firebase not configured. Set VITE_FIREBASE_* environment variables.
```
**Solution**: Copy `.env.example` to `.env` and add your Firebase credentials.

**Permission denied on Firestore**
```
FirebaseError: Missing or insufficient permissions
```
**Solution**: Ensure you're logged in and Firestore rules are deployed.

**Port already in use**
```
Port 5173 is already in use
```
**Solution**: Kill the process or Vite will auto-select another port.

## 🤝 Support

For issues and questions:
- Email: wardwas3107@gmail.com
- Firebase Support: https://firebase.google.com/support
- Vercel Support: https://vercel.com/help

## 📄 License

Copyright (c) 2025 Waseem Abu Akel - All Rights Reserved

PROPRIETARY AND CONFIDENTIAL - See LICENSE file for details.

## 🙏 Acknowledgments

Built with:
- React
- Firebase
- FastAPI
- TailwindCSS
- DEAP (Genetic Algorithms)
- Claude AI API (for analysis features)
