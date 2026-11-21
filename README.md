# OmniStock - Full-Stack Inventory Management System

A production-ready, enterprise-grade inventory management system with secure authentication, role-based access control, comprehensive CRUD operations, reporting capabilities, and modern UI/UX.

## 🚀 Features

### Backend (Node.js + Express + MongoDB)
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Role-Based Access Control** - Admin and Staff roles
- ✅ **Product Management** - Full CRUD with image upload
- ✅ **Category & Supplier Management** - Organize inventory
- ✅ **Stock Operations** - Stock IN/OUT with transaction logging
- ✅ **Reports & Analytics** - Dashboard stats, PDF/Excel export
- ✅ **Security** - Helmet.js, rate limiting, input validation
- ✅ **File Upload** - Multer for product images (5MB limit)

### Frontend (HTML + CSS + Bootstrap + JavaScript)
- ✅ **Modern UI/UX** - Responsive Bootstrap 5 design
- ✅ **Authentication Pages** - Login with role-based redirect
- ✅ **Dashboard** - Statistics, charts, recent activity
- ✅ **Product Management** - Table/card view, search, filter
- ✅ **Stock Operations** - Easy stock IN/OUT interface
- ✅ **Reports** - Generate and export inventory reports

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js)

## 🛠️ Installation & Setup

### 1. Clone/Navigate to Project
```bash
cd c:\Users\Marshal Borad\OneDrive\Desktop\stockomni
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies (already done)
npm install

# Configure environment variables
# Edit .env file with your settings
```

**Environment Variables (.env):**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/stockomni
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=24h
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

**Start MongoDB:**
```bash
# Windows
mongod

# Or if MongoDB is installed as a service, it should already be running
```

**Create Initial Admin User:**

The system requires an admin user to create other users. You can either:

**Option A: Use MongoDB Compass or Shell**
```javascript
// Connect to mongodb://localhost:27017/stockomni
// Insert into 'users' collection:
{
  "name": "Admin User",
  "email": "admin@stockomni.com",
  "password": "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash "admin123"
  "role": "admin",
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

**Option B: Create a seed script** (recommended - see utils/seedData.js)

### 4. Start Backend Server

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

### 5. Frontend Setup

The frontend is static HTML/CSS/JS, so you need a simple HTTP server:

**Option A: Using VS Code Live Server**
1. Install "Live Server" extension in VS Code
2. Right-click on `frontend/pages/login.html`
3. Select "Open with Live Server"

**Option B: Using Python**
```bash
cd frontend
python -m http.server 3000
```

**Option C: Using Node.js http-server**
```bash
npm install -g http-server
cd frontend
http-server -p 3000
```

Frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
omnistock/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── config.js             # Environment config
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Product.js            # Product schema
│   │   ├── Category.js           # Category schema
│   │   ├── Supplier.js           # Supplier schema
│   │   └── Transaction.js        # Transaction schema
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── productController.js  # Product CRUD
│   │   ├── categoryController.js # Category CRUD
│   │   ├── supplierController.js # Supplier CRUD
│   │   ├── stockController.js    # Stock operations
│   │   └── reportController.js   # Reports & analytics
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── products.js           # Product routes
│   │   ├── categories.js         # Category routes
│   │   ├── suppliers.js          # Supplier routes
│   │   ├── stock.js              # Stock routes
│   │   └── reports.js            # Report routes
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── roleCheck.js          # Role-based access
│   │   └── upload.js             # File upload config
│   ├── utils/
│   │   └── generateToken.js      # JWT token generator
│   ├── uploads/                  # Product images
│   ├── .env                      # Environment variables
│   ├── server.js                 # Entry point
│   └── package.json
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css         # Custom styles
│   │   └── js/
│   │       ├── api.js            # API calls
│   │       └── auth.js           # Auth handling
│   └── pages/
│       └── login.html            # Login page
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user (Admin only)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with pagination, search, filter)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (with image upload)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product (Admin only)
- `GET /api/products/low-stock` - Get low stock products

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier (Admin only)

### Stock Operations
- `POST /api/stock/in` - Stock IN
- `POST /api/stock/out` - Stock OUT
- `GET /api/stock/transactions` - Get all transactions
- `GET /api/stock/transactions/:productId` - Get product transactions

### Reports
- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/export/pdf` - Export as PDF
- `GET /api/reports/export/excel` - Export as Excel

## 🔑 Default Credentials

After seeding the database, use these credentials:

**Admin:**
- Email: `admin@stockomni.com`
- Password: `admin123`

**Staff:**
- Email: `staff@stockomni.com`
- Password: `staff123`

## 🧪 Testing the API

You can test the API using:
- **Postman** - Import the API endpoints
- **Thunder Client** (VS Code extension)
- **cURL** commands

**Example Login Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stockomni.com","password":"admin123"}'
```

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Set environment variables
2. Ensure MongoDB is accessible (MongoDB Atlas recommended)
3. Update `FRONTEND_URL` in .env
4. Deploy using platform-specific commands

### Frontend Deployment (Netlify/Vercel)
1. Update API_URL in `frontend/assets/js/api.js`
2. Deploy static files
3. Configure redirects if needed

## 📝 Development Workflow

1. **Start MongoDB**
2. **Start Backend** - `cd backend && npm run dev`
3. **Start Frontend** - Use Live Server or http-server
4. **Access Application** - Navigate to `http://localhost:3000/pages/login.html`

## 🔒 Security Features

- **Password Hashing** - bcrypt with 10 salt rounds
- **JWT Tokens** - 24-hour expiration
- **Protected Routes** - Middleware authentication
- **Role-Based Access** - Admin/Staff permissions
- **Input Validation** - express-validator
- **Rate Limiting** - 100 requests per 15 minutes
- **CORS** - Configured for frontend origin
- **Helmet.js** - HTTP security headers
- **File Upload Security** - Type and size validation

## 📊 Features Roadmap

- [ ] Email notifications for low stock
- [ ] Barcode scanning
- [ ] Multi-warehouse support
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Batch operations
- [ ] Import/Export CSV

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check MONGO_URI in .env
- Verify MongoDB port (default: 27017)

**CORS Error:**
- Update FRONTEND_URL in backend/.env
- Ensure frontend is running on correct port

**Token Expiration:**
- Tokens expire after 24 hours
- Login again to get new token

**File Upload Error:**
- Check file size (max 5MB)
- Ensure file is an image (jpeg, jpg, png, gif, webp)
- Verify uploads/ directory exists

## 📄 License

MIT License - feel free to use for personal or commercial projects

## 👨‍💻 Author

Built with ❤️ for OmniStock

---

**Need Help?** Check the API documentation or create an issue.
