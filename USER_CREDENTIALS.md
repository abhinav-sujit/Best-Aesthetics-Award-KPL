# KlimArt Voting System - User Credentials

**Total Users:** 20 (1 admin + 19 employees)
**Last Updated:** February 2, 2026

---

## Admin Login

| ID | Name | Username | Password |
|----|------|----------|----------|
| 1 | Admin | admin | admin123 |

⚠️ **IMPORTANT:** Change the admin password after first login for security!

---

## Employee Logins (19 employees)

| ID | Name | Username | Password |
|----|------|----------|----------|
| 2 | Kavya | kavya | kavya2847 |
| 3 | Ganesh | ganesh | ganesh5921 |
| 4 | Sahil | sahil | sahil1593 |
| 5 | Prathiksha | prathiksha | prathiksha4571 |
| 6 | Arpana | arpana | arpana9283 |
| 7 | Hemanshu | hemanshu | hemanshu6142 |
| 8 | Migom | migom | migom7395 |
| 9 | Nikita | nikita | nikita4628 |
| 10 | Sam | sam | sam1804 |
| 11 | Satish | satish | satish5937 |
| 12 | Sakshi | sakshi | sakshi2156 |
| 13 | Sai Sidhardha | saisidhardha | saisidhardha6849 |
| 14 | Abhinav | abhinav | abhinav3720 |
| 15 | Shreya | shreya | shreya8514 |
| 16 | Ramya | ramya | ramya9267 |
| 17 | Chaitanya | chaitanya | chaitanya4083 |
| 18 | Mrummayee | mrummayee | mrummayee1675 |
| 19 | Mamatha | mamatha | mamatha7294 |
| 20 | Suganand | suganand | suganand3847 |

---

## How to Add Suganand to Database

If Suganand hasn't been added to the database yet, run this SQL script:

```bash
# Option 1: Via Neon SQL Editor (Web Console)
1. Go to https://console.neon.tech
2. Select your project
3. Go to SQL Editor
4. Copy and paste the contents of scripts/add-suganand.sql
5. Click "Run" to execute

# Option 2: Via psql command line
psql "$POSTGRES_URL" < scripts/add-suganand.sql
```

This will:
- Add Suganand as user ID 20
- Verify the insert was successful
- Show updated employee count (19 employees)
- Show updated total user count (20 users)

---

## Password Format

- **Pattern:** `{name}{4 random digits}`
- **Example:** `kavya2847`, `suganand3847`
- All passwords are stored in plain text as per application requirements
- Usernames are lowercase versions of names (spaces removed)

---

## Security Notes

🔒 **For Production Use:**
1. Change admin password immediately after first login
2. Distribute employee credentials securely (don't email plain text)
3. Consider implementing password change functionality
4. Keep this file secure and don't commit to public repositories

---

## Distribution Format (Copy-Paste Friendly)

### Admin
- Username: `admin`
- Password: `admin123`

### Employees
- **Kavya** - Username: `kavya` / Password: `kavya2847`
- **Ganesh** - Username: `ganesh` / Password: `ganesh5921`
- **Sahil** - Username: `sahil` / Password: `sahil1593`
- **Prathiksha** - Username: `prathiksha` / Password: `prathiksha4571`
- **Arpana** - Username: `arpana` / Password: `arpana9283`
- **Hemanshu** - Username: `hemanshu` / Password: `hemanshu6142`
- **Migom** - Username: `migom` / Password: `migom7395`
- **Nikita** - Username: `nikita` / Password: `nikita4628`
- **Sam** - Username: `sam` / Password: `sam1804`
- **Satish** - Username: `satish` / Password: `satish5937`
- **Sakshi** - Username: `sakshi` / Password: `sakshi2156`
- **Sai Sidhardha** - Username: `saisidhardha` / Password: `saisidhardha6849`
- **Abhinav** - Username: `abhinav` / Password: `abhinav3720`
- **Shreya** - Username: `shreya` / Password: `shreya8514`
- **Ramya** - Username: `ramya` / Password: `ramya9267`
- **Chaitanya** - Username: `chaitanya` / Password: `chaitanya4083`
- **Mrummayee** - Username: `mrummayee` / Password: `mrummayee1675`
- **Mamatha** - Username: `mamatha` / Password: `mamatha7294`
- **Suganand** - Username: `suganand` / Password: `suganand3847`

---

## CSV Format (for spreadsheets)

```csv
ID,Name,Username,Password,Is Admin
1,Admin,admin,admin123,true
2,Kavya,kavya,kavya2847,false
3,Ganesh,ganesh,ganesh5921,false
4,Sahil,sahil,sahil1593,false
5,Prathiksha,prathiksha,prathiksha4571,false
6,Arpana,arpana,arpana9283,false
7,Hemanshu,hemanshu,hemanshu6142,false
8,Migom,migom,migom7395,false
9,Nikita,nikita,nikita4628,false
10,Sam,sam,sam1804,false
11,Satish,satish,satish5937,false
12,Sakshi,sakshi,sakshi2156,false
13,Sai Sidhardha,saisidhardha,saisidhardha6849,false
14,Abhinav,abhinav,abhinav3720,false
15,Shreya,shreya,shreya8514,false
16,Ramya,ramya,ramya9267,false
17,Chaitanya,chaitanya,chaitanya4083,false
18,Mrummayee,mrummayee,mrummayee1675,false
19,Mamatha,mamatha,mamatha7294,false
20,Suganand,suganand,suganand3847,false
```

---

## Support

For issues or questions:
- Check database connection in `.env.local`
- Verify users exist: `SELECT * FROM users ORDER BY id;`
- Reset admin password if locked out
- Contact system administrator for help
