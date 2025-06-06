// Environment Configuration Helper
export const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',

  // Authentication
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',

  // Database
  MONGODB_URI: process.env.MONGODB_URI,
  DB_NAME: process.env.DB_NAME || 'proacademics',

  // API Keys
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // App URLs
  APP_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  
  // Security
  BCRYPT_ROUNDS: 12,
  PASSWORD_MIN_LENGTH: 6,
  SESSION_MAX_AGE: 30 * 24 * 60 * 60, // 30 days

  // Features
  ENABLE_DEMO_USERS: process.env.NODE_ENV === 'development',
  ENABLE_EMAIL_VERIFICATION: process.env.NODE_ENV === 'production',
  ENABLE_PASSWORD_RESET: true,

  // Database fallback (for development when MongoDB is not available)
  USE_MOCK_DATABASE: !process.env.MONGODB_URI && process.env.NODE_ENV === 'development',
}

// Validation
export function validateConfig() {
  const errors: string[] = []

  if (!config.NEXTAUTH_SECRET) {
    errors.push('NEXTAUTH_SECRET is required')
  }

  if (config.IS_PRODUCTION) {
    if (!config.MONGODB_URI) {
      errors.push('MONGODB_URI is required in production')
    }
    if (!config.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY is not set - AI features will use fallbacks')
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`)
  }

  return true
}

// Initialize validation
if (typeof window === 'undefined') {
  validateConfig()
} 