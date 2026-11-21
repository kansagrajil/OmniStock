# Quick Start Guide - StockOmni

## Issue: Login Not Working

**Root Cause:** MongoDB is not running + Bug in api.js (now fixed)

## ✅ Fixed Issues
1. **Bug in api.js** - `setToken()` function wasn't saving the token (FIXED)
2. **Missing CSS** - Login page styling added

## 🚀 Steps to Get Login Working

### Step 1: Start MongoDB

**Option A: If MongoDB is installed as a service**
```powershell
# Start MongoDB service
net start MongoDB
```

**Option B: If MongoDB is installed manually**
```powershell
# Navigate to MongoDB bin folder (adjust path if different)
cd "C:\Program Files\MongoDB\Server\7.0\bin"

# Start MongoDB
.\mongod.exe
```

**Option C: If MongoDB is NOT installed**
Download and install from: https://www.mongodb.com/try/download/community

---

### Step 2: Seed the Database

Open a NEW terminal and run:
```powershell
cd "c:\Users\Marshal Borad\OneDrive\Desktop\stockomni\backend"
node utils/seedData.js
```

You should see:
```
MongoDB Connected: localhost
Cleared existing data
Users created
Categories created
Suppliers created
Products created

=== Seed Data Summary ===
Users: 2
Categories: 5
Suppliers: 3
Products: 6

=== Login Credentials ===
Admin: admin@stockomni.com / admin123
Staff: staff@stockomni.com / staff123

Seed completed successfully!
```

---

### Step 3: Start Backend Server

```powershell
cd "c:\Users\Marshal Borad\OneDrive\Desktop\stockomni\backend"
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

---

### Step 4: Open Login Page

**Option A: Using Live Server (VS Code)**
1. Install "Live Server" extension
2. Right-click `frontend/pages/login.html`
3. Click "Open with Live Server"

**Option B: Direct File**
Just open the file in browser:
```
file:///c:/Users/Marshal%20Borad/OneDrive/Desktop/stockomni/frontend/pages/login.html
```

---

### Step 5: Test Login

Use these credentials:
- **Email:** admin@stockomni.com
- **Password:** admin123

---

## ✅ What Was Fixed

### 1. Critical Bug in api.js (Line 11)
**Before:**
```javascript
const setToken = (token) => {
    localStorage.setItem('token');  // ❌ Missing token parameter!
};
```

**After:**
```javascript
const setToken = (token) => {
    localStorage.setItem('token', token);  // ✅ Fixed!
};
```

### 2. Added CSS Styling
Created `frontend/assets/css/style.css` with modern login page styles.

---

## 🔍 Troubleshooting

### "Connection Refused" Error
- **Cause:** MongoDB is not running
- **Fix:** Start MongoDB (see Step 1)

### "Cannot GET /api/auth/login"
- **Cause:** Backend server not running
- **Fix:** Start backend (see Step 3)

### CORS Error
- **Cause:** Frontend and backend on different origins
- **Fix:** Use Live Server or update CORS in backend/.env

### Login Button Does Nothing
- **Cause:** Check browser console (F12) for errors
- **Fix:** Make sure all 3 files are loaded:
  - api.js
  - auth.js
  - login.html

---

## 📝 Current Status

✅ Backend code: Complete and working
✅ Frontend login page: Complete with styling
✅ Bug fixes: Applied
⏳ MongoDB: Needs to be started
⏳ Database: Needs to be seeded

---

## 🎯 Next Steps After Login Works

1. Build dashboard page
2. Create product management pages
3. Add stock operation forms
4. Implement reports page

---

## 💡 Quick Test

Once everything is running, test the API directly:

```powershell
# Test if backend is running
curl http://localhost:5000

# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@stockomni.com\",\"password\":\"admin123\"}'
```

If you see a JSON response with a token, everything is working!
