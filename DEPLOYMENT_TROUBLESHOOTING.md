# Deployment Troubleshooting Guide

## Common 404 Error Solutions

### 1. Check Vercel Configuration
- Verify `vercel.json` has proper rewrites for SPA routing
- Ensure `"destination": "/index.html"` is set for all routes

### 2. Build Process Issues
- Run `npm run build` locally to verify builds work
- Check for TypeScript errors: `npm run type-check`
- Verify all environment variables are set in Vercel dashboard

### 3. Firebase Configuration
- Ensure Firebase project is properly configured
- Check that Firebase environment variables are set in Vercel
- Verify Firebase Auth domain includes your Vercel domain

### 4. Routing Issues
- Check React Router configuration in `App.tsx`
- Verify all routes are properly defined
- Test authentication flow in both dev and production

### 5. Build Output Verification
- Check that `dist` folder is generated correctly
- Verify `index.html` exists in build output
- Check that all assets are properly referenced

## Debugging Steps

1. **Check Vercel Logs**: Go to Vercel dashboard → Functions → View logs
2. **Test Health Check**: Visit `https://your-app.vercel.app/health.json`
3. **Browser DevTools**: Check for JavaScript errors in console
4. **Network Tab**: Look for failed requests
5. **Local Build**: Run `npm run build && npm run preview` locally

## Quick Fixes

### For 404 on Page Refresh:
- Check `vercel.json` rewrites configuration
- Ensure SPA routing is properly configured

### For Build Failures:
- Update dependencies: `npm update`
- Clear cache: `npm ci`
- Check Node.js version compatibility

### For Firebase Auth Issues:
- Verify Firebase project configuration
- Check environment variables in Vercel
- Ensure auth domain includes your Vercel URL

## Environment Variables Required

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
```

## Support

If issues persist after following this guide:
1. Check the Vercel deployment logs
2. Verify all environment variables are set
3. Test the build process locally
4. Check Firebase console for any errors
