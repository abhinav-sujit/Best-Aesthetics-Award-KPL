# 🚀 Deployment Checklist

Use this checklist to deploy the KlimArt Voting Application to Vercel.

## Pre-Deployment

- [ ] Code is committed to Git repository
- [ ] All files are in place (check README.md for structure)
- [ ] `.gitignore` is configured to exclude sensitive files

## Database Setup

- [ ] Vercel Postgres database created
- [ ] Connection string (`POSTGRES_URL`) copied
- [ ] Schema applied: `psql "$POSTGRES_URL" < scripts/schema.sql`
- [ ] Database connection tested successfully
- [ ] Verify tables exist: `users`, `voting_dates`, `votes`, `tie_resolutions`

## Environment Variables

- [ ] `.env.local` created from `.env.local.example`
- [ ] `POSTGRES_URL` set with database connection string
- [ ] `JWT_SECRET` generated (32+ characters, random)
- [ ] `NODE_ENV` set to appropriate value

## Database Seeding

- [ ] Dependencies installed: `npm install`
- [ ] Seed script executed: `npm run seed`
- [ ] Verify 21 voting dates inserted
- [ ] Verify admin user created (username: `admin`)
- [ ] **Admin password noted** (default: `admin123`)

## Local Testing

- [ ] Local development server starts: `npm run dev`
- [ ] Admin can login at http://localhost:3000
- [ ] User management works (create/edit/delete users)
- [ ] Test employee account created
- [ ] Employee can login
- [ ] Employee can cast vote
- [ ] Admin can view results
- [ ] No console errors in browser

## Vercel Deployment

### Via Vercel CLI

- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Run `vercel` command
- [ ] Follow prompts to link project
- [ ] Deployment successful

### Via GitHub Integration

- [ ] Code pushed to GitHub
- [ ] Repository imported in Vercel
- [ ] Project linked to repository

## Vercel Configuration

- [ ] Environment variables added in Vercel dashboard:
  - [ ] `POSTGRES_URL`
  - [ ] `JWT_SECRET`
  - [ ] `NODE_ENV=production`
- [ ] Build settings verified (should auto-detect)
- [ ] Deployment triggered

## Post-Deployment Verification

- [ ] Production URL accessible
- [ ] Static files load (CSS, JS)
- [ ] API endpoints responding:
  - [ ] `GET /api/dates` returns voting dates
- [ ] Admin login works
- [ ] **Admin password changed** from default
- [ ] Test user account works
- [ ] Voting flow works end-to-end
- [ ] Results display correctly
- [ ] No errors in Vercel function logs

## User Setup

- [ ] All employee accounts created via admin dashboard
- [ ] Employee credentials documented/distributed securely
- [ ] Test login for at least 3 employees
- [ ] Voting instructions sent to employees

## Monitoring

- [ ] Vercel dashboard bookmarked
- [ ] Error alerts configured (optional)
- [ ] Database backup verified (Vercel auto-backups)
- [ ] Admin contact information documented

## Security Checks

- [ ] Admin password changed from default `admin123`
- [ ] JWT_SECRET is strong and random
- [ ] `.env.local` is in `.gitignore`
- [ ] No credentials committed to Git
- [ ] HTTPS enforced (automatic on Vercel)

## Documentation

- [ ] README.md reviewed
- [ ] Admin trained on user management
- [ ] Employee voting guide created (optional)
- [ ] Support contact documented

## Rollback Plan

- [ ] Previous version tagged in Git (if applicable)
- [ ] Vercel deployment history noted
- [ ] Database export available: via admin export feature

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Apply database schema
psql "$POSTGRES_URL" < scripts/schema.sql

# Seed database
npm run seed

# Local development
npm run dev

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

---

## Troubleshooting

### API returns 500 errors
- Check Vercel function logs
- Verify environment variables are set
- Test database connection

### Cannot login
- Verify user exists in database
- Check JWT_SECRET is set
- Clear browser localStorage
- Check browser console for errors

### Votes not saving
- Check database connection
- Verify `votes` table exists
- Check for duplicate vote constraint errors
- Review Vercel function logs

---

## Support Contacts

- System Administrator: [Contact Info]
- Database Issues: [Vercel Support]
- Application Issues: [Admin Contact]

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Production URL**: _______________
**Notes**: _____________________________________________
