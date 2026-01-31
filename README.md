# KlimArt Voting Application

Full-stack voting application for the **KlimArt Premiere League - Best Aesthetics Award (January 2026)**.

## 🏗️ Architecture

- **Frontend**: Vanilla JavaScript (no framework)
- **Backend**: Node.js with Vercel Serverless Functions
- **Database**: Vercel Postgres (PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel

## 📁 Project Structure

```
├── api/                    # Backend API endpoints
│   ├── auth/              # Authentication (login, verify)
│   ├── votes/             # Voting endpoints
│   ├── admin/             # Admin endpoints
│   └── dates.js           # Voting dates endpoint
├── lib/                    # Shared backend utilities
│   ├── db.js              # Database connection
│   ├── auth.js            # JWT utilities
│   └── middleware.js      # Auth middleware
├── public/                 # Frontend static files
│   ├── index.html
│   ├── css/
│   └── js/
│       ├── api.js         # API client layer
│       ├── app.js         # Main application logic
│       ├── data.js        # Static data and helpers
│       └── storage.js     # Data management
├── scripts/
│   ├── schema.sql         # Database schema
│   └── seed.js            # Database seeding
├── package.json
├── vercel.json            # Vercel configuration
└── .env.local.example     # Environment variables template
```

## 🚀 Deployment Guide

### 1. Prerequisites

- Node.js 18+ installed
- Vercel account
- Git repository (optional but recommended)

### 2. Database Setup

#### Option A: Vercel Postgres (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create new project or select existing
3. Go to **Storage** tab
4. Create **Vercel Postgres** database
5. Copy the `POSTGRES_URL` connection string

#### Option B: External PostgreSQL

Use any PostgreSQL 12+ database (Supabase, Railway, etc.)

### 3. Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your values:
   ```env
   POSTGRES_URL=postgresql://user:pass@host:5432/db
   JWT_SECRET=your-256-bit-secret-key
   NODE_ENV=development
   ```

3. Generate secure JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Database Initialization

Run the schema to create tables:
```bash
# If using Vercel Postgres
psql "$POSTGRES_URL" < scripts/schema.sql

# Or use any PostgreSQL client
```

Seed initial data (voting dates + admin user):
```bash
npm run seed
```

This creates:
- 21 voting dates for January 2026
- Admin user (username: `admin`, password: `admin123`)

⚠️ **IMPORTANT**: Change the admin password after first login!

### 6. Local Development

```bash
npm run dev
```

Visit http://localhost:3000

### 7. Deploy to Vercel

#### Via Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Via GitHub Integration:

1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Add environment variables in Vercel project settings:
   - `POSTGRES_URL`
   - `JWT_SECRET`
   - `NODE_ENV` = `production`
4. Deploy

### 8. Post-Deployment Setup

1. Login as admin (`admin` / `admin123`)
2. Navigate to **User Management** tab (admin dashboard)
3. **Change admin password** immediately
4. Create employee accounts for all voters

## 👤 User Management

### Admin Dashboard Features

- ✅ View voting results by date
- ✅ Overall standings/rankings
- ✅ Resolve tie votes
- ✅ Monitor voting progress
- ✅ Export data as JSON
- ✅ **Create/Edit/Delete users**

### Creating Employee Accounts

1. Login as admin
2. Go to **User Management** tab
3. Click **+ Add New User**
4. Fill in details:
   - Name (display name)
   - Username (login ID)
   - Password
   - Is Admin? (checkbox)
5. Click **Save**

### Updating User Credentials

1. Find user in User Management list
2. Click **Edit**
3. Update name, username, or password
4. Click **Save**

### Deleting Users

1. Find user in User Management list
2. Click **Delete**
3. Confirm deletion

**Note**: Deleting a user does NOT delete their votes (votes are preserved in database).

## 🗳️ Employee Features

- View all active voting dates
- Cast one vote per date
- View voting history
- Vote for any employee or cast NULL vote
- See voting progress

## 🔐 Security

- **Authentication**: JWT tokens with 24h expiration
- **Authorization**: Role-based access (employee vs admin)
- **Password Storage**: Plain text (per requirements - admin manages all credentials)
- **SQL Injection**: Prevented via parameterized queries
- **HTTPS**: Enforced by Vercel in production

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Login (returns JWT)
- `POST /api/auth/verify` - Verify JWT token

### Voting (Authenticated)
- `GET /api/dates` - Get voting dates
- `POST /api/votes/cast` - Cast a vote
- `GET /api/votes/check/:userId/:date` - Check vote status
- `GET /api/votes/user/:userId` - Get user's voting history

### Admin (Admin Only)
- `GET /api/admin/results/:date` - Daily results
- `GET /api/admin/standings` - Overall standings
- `GET /api/admin/progress/:date` - Voting progress
- `GET /api/admin/progress/all` - All dates progress
- `GET /api/admin/ties/unresolved` - Unresolved ties
- `POST /api/admin/ties/resolve` - Resolve a tie
- `GET /api/admin/export` - Export all data
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## 🛠️ Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql "$POSTGRES_URL" -c "SELECT NOW();"
```

Ensure:
- Connection string is correct
- Database is accessible from your IP
- SSL is configured (Vercel Postgres requires SSL)

### Build Errors on Vercel

1. Check Node.js version (requires 18+)
2. Verify all environment variables are set
3. Check build logs in Vercel dashboard

### API Returns 401 Unauthorized

- JWT token may be expired (24h expiration)
- Logout and login again
- Check browser console for errors

### Cannot Create Users

- Ensure you're logged in as admin
- Check that admin user has `is_admin = true` in database
- Verify API endpoint `/api/admin/users` is accessible

## 📝 Database Schema

```sql
users               # Employees and admins
  - id (PK)
  - name
  - username (unique)
  - password
  - is_admin
  - created_at
  - updated_at

voting_dates        # Active voting dates
  - id (PK)
  - date (unique)
  - is_active
  - created_at

votes               # Cast votes
  - id (PK)
  - voter_id (FK -> users)
  - voting_date (FK -> voting_dates)
  - voted_for_id (FK -> users, nullable)
  - is_null_vote
  - voted_at
  - UNIQUE(voter_id, voting_date)

tie_resolutions     # Admin tie resolutions
  - id (PK)
  - voting_date (FK -> voting_dates)
  - winner_id (FK -> users)
  - resolved_at
  - resolved_by (FK -> users)
```

## 🎨 Design

- **Brand**: KlimArt
- **Colors**: Black (#000000), Red (#DF322E), White (#FFFFFF)
- **Font**: Inter (Google Fonts)
- **Style**: Minimalist, clean, modern

## 📄 License

Internal use only - KlimArt Premiere League January 2026

## 🆘 Support

For issues or questions, contact the system administrator.

---

Built with ❤️ for KlimArt Premiere League
