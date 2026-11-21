# Login "Failed to Fetch" - SOLUTION

## Problem
The login page shows "Failed to fetch" because:
1. ✅ Backend server tried to start but **crashed**
2. ❌ **MongoDB is not running or not accessible**

## Quick Fix - 3 Steps

### Step 1: Install/Start MongoDB

**Check if MongoDB is installed:**
```powershell
mongod --version
```

**If NOT installed, download here:**
https://www.mongodb.com/try/download/community

**After installation, start MongoDB:**

**Option A: Start as Windows Service**
```powershell
# Run as Administrator
net start MongoDB
```

**Option B: Start Manually**
```powershell
# Create data directory
mkdir C:\data\db

# Start MongoDB
mongod --dbpath C:\data\db
```

Keep this terminal open!

---

### Step 2: Start Backend Server

Open a **NEW terminal** and run:
```powershell
cd "c:\Users\Marshal Borad\OneDrive\Desktop\stockomni\backend"
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

If you see "MongoDB Connected", proceed to Step 3!

---

### Step 3: Seed the Database

Open **ANOTHER NEW terminal** and run:
```powershell
cd "c:\Users\Marshal Borad\OneDrive\Desktop\stockomni\backend"
node utils/seedData.js
```

You should see:
```
MongoDB Connected: localhost
Cleared existing data
Users created
...
Seed completed successfully!
```

---

## Test Login

Now refresh your login page and try:
- **Email:** admin@stockomni.com
- **Password:** admin123

---

## Still Not Working?

### Test 1: Check if MongoDB is running
```powershell
# Should show mongod process
Get-Process mongod
```

### Test 2: Check if backend is running
```powershell
# Should return JSON
curl http://localhost:5000
```

### Test 3: Check MongoDB connection
```powershell
# Should connect
mongo
# or
mongosh
```

---

## Alternative: Use MongoDB Atlas (Cloud)

If local MongoDB won't work, use MongoDB Atlas (free):

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free cluster
3. Get connection string
4. Update `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/stockomni
   ```
5. Restart backend server

---

## Error Messages & Fixes

### "MongooseServerSelectionError"
- **Cause:** MongoDB not running
- **Fix:** Start MongoDB (Step 1)

### "ECONNREFUSED 127.0.0.1:27017"
- **Cause:** MongoDB not listening on port 27017
- **Fix:** Check MongoDB is running with `Get-Process mongod`

### "Failed to fetch"
- **Cause:** Backend not running
- **Fix:** Start backend (Step 2)

---

## Current Status

🔴 MongoDB: Not running
🔴 Backend: Crashed (needs MongoDB)
✅ Frontend: Working
✅ Code: All fixed and ready

**Next:** Start MongoDB, then backend will work!
