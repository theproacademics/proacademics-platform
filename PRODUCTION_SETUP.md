# Production Setup Guide - Admin/Students Fix

## 🚨 Common Issue: Admin/Students Not Working in Production

This guide addresses the specific issue where `/admin/students` works locally but fails in production.

## 🔍 Root Causes

1. **Missing Admin User**: Demo admin only created in development
2. **Environment Variables**: Missing required production environment variables
3. **Database Connection**: MongoDB connection issues in production
4. **Authentication**: NextAuth configuration problems

## ✅ Step-by-Step Fix

### Step 1: Set Environment Variables

Ensure these environment variables are set in your production environment:

```bash
# Required for database connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Required for authentication
NEXTAUTH_SECRET=your-super-secret-key-here-at-least-32-characters
NEXTAUTH_URL=https://your-production-domain.com

# Optional
DB_NAME=proacademics
NODE_ENV=production
```

### Step 2: Check System Health

Visit `/api/health` to check your production environment:

```bash
curl https://your-domain.com/api/health
```

Expected healthy response:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "status": "healthy",
  "checks": {
    "database": true,
    "mongodb_uri": true,
    "nextauth_secret": true,
    "admin_exists": true
  },
  "errors": []
}
```

### Step 3: Create Production Admin User

Use the admin setup endpoint to create an admin user:

```bash
curl -X POST https://your-domain.com/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "setupKey": "setup-admin-2024",
    "adminEmail": "admin@yourdomain.com",
    "adminPassword": "your-secure-password",
    "adminName": "Production Admin"
  }'
```

### Step 4: Test Admin Access

1. Go to `/auth/signin`
2. Login with your admin credentials
3. Navigate to `/admin/students`
4. Check browser console for any errors

## 🔧 Troubleshooting

### Issue: Database Connection Failed
- Verify `MONGODB_URI` is correct
- Check if your MongoDB cluster allows connections from your production server
- Ensure database user has proper permissions

### Issue: No Admin Users Found
- Run the admin setup endpoint (Step 3)
- Check database directly for admin users:
  ```javascript
  db.users.find({ role: "admin" })
  ```

### Issue: Authentication Errors
- Verify `NEXTAUTH_SECRET` is set and secure
- Check `NEXTAUTH_URL` matches your production domain
- Clear browser cookies and try again

### Issue: API Returns 500 Error
- Check server logs for detailed error messages
- Test individual API endpoints:
  - `/api/health` - System health
  - `/api/admin/setup` - Admin setup
  - `/api/admin/students` - Students data

## 📋 Quick Checklist

- [ ] `MONGODB_URI` environment variable set
- [ ] `NEXTAUTH_SECRET` environment variable set (32+ characters)
- [ ] `NEXTAUTH_URL` matches production domain
- [ ] Database is accessible from production server
- [ ] Admin user exists in database
- [ ] Can sign in with admin credentials
- [ ] `/api/health` returns healthy status

## 🆘 Emergency Access

If you're completely locked out, you can create an admin user directly in MongoDB:

```javascript
// Connect to your MongoDB and run:
db.users.insertOne({
  id: "emergency-admin-" + Date.now(),
  name: "Emergency Admin",
  email: "emergency@yourdomain.com",
  password: "$2b$12$HASHED_PASSWORD_HERE", // Use bcrypt to hash
  role: "admin",
  permissions: ["manage_users", "manage_content", "view_analytics", "manage_system"],
  createdAt: new Date(),
  updatedAt: new Date(),
  isEmailVerified: true
})
```

## 📞 Support

If issues persist:
1. Check server logs for detailed error messages
2. Test each API endpoint individually
3. Verify environment variables are loaded correctly
4. Ensure database connectivity and permissions 