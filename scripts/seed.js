/**
 * Database Seeding Script
 * Seeds initial data: voting dates and admin user
 * Run with: node scripts/seed.js
 */

require('dotenv').config({ path: '.env.local' });
const { query, testConnection } = require('../lib/db');

// January 2026 voting dates
const JANUARY_2026_DATES = [
    "2026-01-02", "2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08",
    "2026-01-09", "2026-01-10", "2026-01-12", "2026-01-13", "2026-01-15",
    "2026-01-16", "2026-01-19", "2026-01-20", "2026-01-21", "2026-01-22",
    "2026-01-24", "2026-01-27", "2026-01-28", "2026-01-29", "2026-01-30",
    "2026-01-31"
];

async function seedDatabase() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // Test database connection
        console.log('📡 Testing database connection...');
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Database connection failed');
        }

        // Seed voting dates
        console.log('\n📅 Seeding voting dates...');
        for (const date of JANUARY_2026_DATES) {
            try {
                await query(
                    'INSERT INTO voting_dates (date, is_active) VALUES ($1, $2) ON CONFLICT (date) DO NOTHING',
                    [date, true]
                );
                console.log(`   ✓ Added date: ${date}`);
            } catch (error) {
                console.log(`   ✗ Date ${date} already exists or error: ${error.message}`);
            }
        }

        // Seed initial admin user
        console.log('\n👤 Seeding admin user...');
        try {
            const result = await query(
                `INSERT INTO users (name, username, password, is_admin)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (username) DO NOTHING
                 RETURNING id, username`,
                ['Admin', 'admin', 'admin123', true]
            );

            if (result.rows.length > 0) {
                console.log(`   ✓ Admin user created`);
                console.log(`     Username: admin`);
                console.log(`     Password: admin123`);
                console.log(`     ⚠️  IMPORTANT: Change this password after first login!`);
            } else {
                console.log(`   ℹ️  Admin user already exists`);
            }
        } catch (error) {
            console.log(`   ✗ Error creating admin: ${error.message}`);
        }

        console.log('\n✅ Database seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - Voting dates: ${JANUARY_2026_DATES.length} dates`);
        console.log(`   - Admin user: Created/Verified`);
        console.log('\n🚀 Next steps:');
        console.log('   1. Login as admin (username: admin, password: admin123)');
        console.log('   2. Create employee users via admin dashboard');
        console.log('   3. Change admin password for security\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Seeding failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run seeding
seedDatabase();
