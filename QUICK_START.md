# ⚡ Quick Start Guide

Get the KlimArt Voting Application running in 10 minutes.

## 🚀 Fast Track Deployment

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Setup Environment (2 min)

1. Create Vercel Postgres database at [vercel.com/storage](https://vercel.com/storage)
2. Copy the connection string
3. Create `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Edit `.env.local`:
   ```env
   POSTGRES_URL=your-postgres-connection-string
   JWT_SECRET=run-this-command-to-generate
   NODE_ENV=development
   ```
5. Generate JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Step 3: Initialize Database (2 min)

```bash
# Apply schema
psql "$POSTGRES_URL" < scripts/schema.sql

# Seed data (creates admin user + voting dates)
npm run seed
```

### Step 4: Test Locally (2 min)

```bash
# Start dev server
npm run dev
```

Visit http://localhost:3000

**Login as admin:**
- Username: `admin`
- Password: `admin123`

### Step 5: Deploy to Vercel (3 min)

```bash
# Install Vercel CLI (first time only)
npm i -g vercel

# Deploy
vercel
```

**Or** use Vercel GitHub integration:
1. Push to GitHub
2. Import in Vercel dashboard
3. Add environment variables in Vercel project settings
4. Deploy

---

## ✅ Post-Deployment Checklist

After deployment:

1. ✅ Login as admin
2. ✅ **Change admin password** (User Management → Edit admin user)
3. ✅ Create employee accounts (User Management → Add New User)
4. ✅ Test employee login
5. ✅ Test voting flow
6. ✅ Distribute credentials to employees

---

## 🎯 Common Tasks

### Create Employee Account

1. Login as admin
2. Click **User Management** tab
3. Click **+ Add New User**
4. Fill in:
   - Name: `Kavya`
   - Username: `kavya`
   - Password: `KavyaKPL@26` (or any password)
   - Is Admin: ☐ (unchecked)
5. Click **Save**

### Change User Password

1. Go to User Management
2. Find user, click **Edit**
3. Update password field
4. Click **Save**

### View Results

1. Login as admin
2. Click **Daily Results** tab
3. Select date from dropdown
4. View vote counts and winner

### Export Data

1. Login as admin
2. Click **Data Management** tab
3. Click **Export Data**
4. JSON file downloads automatically

---

## 🐛 Troubleshooting

### Cannot login
```bash
# Check if admin user exists
psql "$POSTGRES_URL" -c "SELECT * FROM users WHERE is_admin = true;"

# If empty, run seed again
npm run seed
```

### Database connection error
```bash
# Test connection
psql "$POSTGRES_URL" -c "SELECT NOW();"

# Check if tables exist
psql "$POSTGRES_URL" -c "\dt"
```

### API returns 401
- Token expired (login again)
- Check JWT_SECRET is set
- Verify environment variables in Vercel

### Vercel deployment fails
- Check Node.js version (need 18+)
- Verify all environment variables set in Vercel dashboard
- Review build logs in Vercel

---

## 📱 Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Generate JWT secret | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| Apply schema | `psql "$POSTGRES_URL" < scripts/schema.sql` |
| Seed database | `npm run seed` |
| Start dev server | `npm run dev` |
| Deploy to Vercel | `vercel` |
| Deploy to production | `vercel --prod` |

---

## 🔗 Important Links

- **Local Dev**: http://localhost:3000
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Postgres Dashboard**: https://vercel.com/storage
- **Full Documentation**: See `README.md`
- **Deployment Checklist**: See `DEPLOYMENT_CHECKLIST.md`

---

## 💡 Tips

- Always change the default admin password (`admin123`) after first login
- Create user accounts **before** sharing login page with employees
- Use User Management dashboard for all credential changes
- Export data regularly for backups
- Check Vercel function logs if API issues occur

---

**Default Admin Credentials** (change these immediately!):
- Username: `admin`
- Password: `admin123`

---

Need help? See `README.md` for detailed documentation.
