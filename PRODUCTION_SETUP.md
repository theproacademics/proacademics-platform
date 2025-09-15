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

# Admin credentials (used for admin panel authentication)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_NAME=System Administrator

# Optional - for client-side access
NEXT_PUBLIC_ADMIN_NAME=System Administrator
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourdomain.com

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

### Step 3: Admin Authentication

Admin authentication now works directly from environment variables. No need to create admin users in the database.

Simply set the `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` environment variables as shown in Step 1, and the admin panel will authenticate using these credentials.

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
- [ ] `ADMIN_EMAIL` environment variable set
- [ ] `ADMIN_PASSWORD` environment variable set
- [ ] `ADMIN_NAME` environment variable set
- [ ] Database is accessible from production server
- [ ] Can sign in with admin credentials
- [ ] `/api/health` returns healthy status

## 🆘 Emergency Access

If you're completely locked out, simply update your environment variables:

1. Set `ADMIN_EMAIL` to your desired admin email
2. Set `ADMIN_PASSWORD` to your desired admin password  
3. Set `ADMIN_NAME` to your desired admin name
4. Restart your application

No database changes needed - admin authentication is now handled purely through environment variables.

## 📞 Support

If issues persist:
1. Check server logs for detailed error messages
2. Test each API endpoint individually
3. Verify environment variables are loaded correctly
4. Ensure database connectivity and permissions 