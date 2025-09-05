# Development Guide

## Local Development Setup

This guide helps you develop locally without affecting the production application.

### 🚀 Quick Start

1. **Start the backend server (development mode):**

   ```bash
   cd greenbits-store/server
   npm run dev:local
   ```

   This will start the server on port 5001 (not 5000 to avoid conflicts)

2. **Start the frontend (development mode):**
   ```bash
   cd greenbits-store
   npm run dev
   ```
   This will start the frontend on port 5173

### 🔧 Environment Configuration

- **Development**: Uses `.env.development` (port 5001)
- **Production**: Uses `.env` (port 5000)

### 📁 File Structure

```
greenbits-store/
├── server/
│   ├── .env                 # Production configuration
│   ├── .env.development     # Development configuration
│   └── package.json         # Updated with dev scripts
├── .env                     # Frontend development config
└── DEVELOPMENT.md           # This file
```

### 🌐 URLs

- **Local Backend**: http://localhost:5001
- **Local Frontend**: http://localhost:5173
- **Production Backend**: https://gamecity-backend-i2sy.onrender.com
- **Production Frontend**: https://game-city-one.vercel.app

### 🔄 Development Workflow

1. **Make changes locally** on port 5001
2. **Test thoroughly** before pushing
3. **Push to GitHub** when ready
4. **Production deploys automatically** from GitHub

### ⚠️ Important Notes

- **Never run production server locally** - it conflicts with deployed version
- **Always use `npm run dev:local`** for development
- **Check `.env.development`** for local configuration
- **Database is shared** - be careful with test data

### 🐛 Troubleshooting

**Port already in use:**

- Make sure you're using `npm run dev:local` (port 5001)
- Check if another process is using port 5001: `netstat -ano | findstr :5001`

**Database issues:**

- Development uses the same database as production
- Be careful not to create test users that affect production

**Email issues:**

- Development uses the same email service
- Test emails will be sent from gamecityelectronicsonline@gmail.com
