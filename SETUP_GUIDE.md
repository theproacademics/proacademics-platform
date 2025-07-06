# 🚀 ProAcademics Platform Setup Guide

## Quick Start

### 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# ==========================================
# ProAcademics Platform Environment Variables
# ==========================================

# ===================
# REQUIRED VARIABLES
# ===================

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/proacademics
DB_NAME=proacademics

# Authentication (NextAuth.js)
NEXTAUTH_SECRET=your-super-secret-key-here-at-least-32-characters-long
NEXTAUTH_URL=http://localhost:3000

# ===================
# OPTIONAL VARIABLES
# ===================

# Environment
NODE_ENV=development

# AI Features (OpenAI)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Zoom Integration
ZOOM_API_KEY=your-zoom-api-key
ZOOM_API_SECRET=your-zoom-api-secret

# Admin Setup (for production)
ADMIN_SETUP_KEY=setup-admin-2024
```

### 2. Required Setup Steps

#### Generate NextAuth Secret
```bash
# Generate a secure secret key
openssl rand -base64 32
```

#### MongoDB Setup Options

**Option A: MongoDB Atlas (Recommended)**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Get your connection string
4. Replace `<username>`, `<password>`, and `<cluster>` in the URI

**Option B: Local MongoDB**
```bash
# Install MongoDB locally
brew install mongodb/brew/mongodb-community
brew services start mongodb-community
# Use: MONGODB_URI=mongodb://localhost:27017/proacademics
```

**Option C: Development Mode (No Database)**
- Leave `MONGODB_URI` empty
- App will use mock data automatically in development

### 3. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

### 4. Create Admin User

#### Option A: Using Setup API (Recommended)
```bash
curl -X POST http://localhost:3000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "setupKey": "setup-admin-2024",
    "adminEmail": "admin@example.com",
    "adminPassword": "secure-password-123",
    "adminName": "Admin User"
  }'
```

#### Option B: Demo Users (Development Only)
In development mode, demo users are automatically created:
- **Admin**: admin@example.com / password123
- **Student**: student@example.com / password123
- **Teacher**: teacher@example.com / password123

### 5. Check System Health

Visit [http://localhost:3000/api/health](http://localhost:3000/api/health) to verify:
- Database connection
- Environment variables
- Admin user existence

## 🎯 Key Features

- **Student Dashboard**: Lessons, homework, progress tracking
- **Admin Panel**: User management, analytics, system configuration
- **AI Integration**: LEX AI for personalized learning recommendations
- **Zoom Integration**: Virtual classroom sessions
- **Authentication**: Secure user authentication with NextAuth.js
- **Mobile Responsive**: Works on all devices

## 🛠️ Development Tips

### Mock Data Mode
When MongoDB is not available, the app automatically uses mock data:
- Users, lessons, and homework are simulated
- Perfect for quick development and testing
- Switch to real database by setting `MONGODB_URI`

### AI Features
Without OpenAI API key:
- AI recommendations use fallback logic
- All functionality remains available
- Set `OPENAI_API_KEY` for real AI features

### Production Deployment
See `PRODUCTION_SETUP.md` for detailed production deployment instructions.

## 📁 Project Structure

```
proacademics-platform/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── ...                # Student pages
├── components/            # Reusable UI components
├── lib/                   # Utility functions and database
├── models/                # Database schemas
└── types/                 # TypeScript definitions
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB URI format
   - Verify network access in MongoDB Atlas
   - Use mock data mode for development

2. **Authentication Errors**
   - Ensure NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain
   - Clear browser cookies

3. **Admin Access Issues**
   - Run admin setup API
   - Check /api/health for admin status
   - Use demo admin in development

### Getting Help

1. Check `/api/health` endpoint for system status
2. Review browser console for client-side errors
3. Check server logs for detailed error messages
4. Refer to `PRODUCTION_SETUP.md` for production issues

## 🎉 You're Ready!

Your ProAcademics platform is now ready for development. Start by:
1. Creating your admin user
2. Adding some demo students
3. Exploring the admin dashboard
4. Testing the AI features 