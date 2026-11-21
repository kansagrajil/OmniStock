# StockOmni API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/login
Login to get JWT token

**Request Body:**
```json
{
  "email": "admin@stockomni.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "_id": "...",
  "name": "Admin User",
  "email": "admin@stockomni.com",
  "role": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/register
Register new user (Admin only)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "New User",
  "email": "user@example.com",
  "password": "password123",
  "role": "staff"
}
```

#### GET /auth/me
Get current user info

**Headers:**
```
Authorization: Bearer <token>
```

---

### Products

#### GET /products
Get all products with pagination, search, and filters

**Query Parameters:**
- `search` - Search in name, SKU, description
- `category` - Filter by category ID
- `supplier` - Filter by supplier ID
- `lowStock` - Filter low stock items (true/false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example:**
```
GET /products?search=laptop&page=1&limit=10
```

#### POST /products
Create new product with image upload

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `name` - Product name (required)
- `sku` - SKU code (required, unique)
- `category` - Category ID (required)
- `supplier` - Supplier ID
- `quantity` - Stock quantity (required)
- `price` - Product price (required)
- `description` - Product description
- `expiryDate` - Expiry date
- `lowStockThreshold` - Low stock alert level
- `image` - Product image file (max 5MB)

#### PUT /products/:id
Update product

#### DELETE /products/:id
Delete product (Admin only)

---

### Categories

#### GET /categories
Get all categories

#### POST /categories
Create category

**Request Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic devices"
}
```

---

### Stock Operations

#### POST /stock/in
Add stock

**Request Body:**
```json
{
  "productId": "...",
  "quantity": 10,
  "notes": "Received from supplier"
}
```

#### POST /stock/out
Remove stock

**Request Body:**
```json
{
  "productId": "...",
  "quantity": 5,
  "notes": "Sold to customer"
}
```

#### GET /stock/transactions
Get all transactions

**Query Parameters:**
- `productId` - Filter by product
- `type` - Filter by type (IN/OUT)
- `page` - Page number
- `limit` - Items per page

---

### Reports

#### GET /reports/dashboard
Get dashboard statistics

**Response:**
```json
{
  "totalProducts": 50,
  "totalStockValue": "125000.00",
  "lowStockCount": 5,
  "lowStockProducts": [...],
  "recentTransactions": [...],
  "stockMovement": {
    "stockIn": 100,
    "stockOut": 75,
    "period": "7 days"
  }
}
```

#### GET /reports/export/pdf
Export inventory report as PDF

#### GET /reports/export/excel
Export inventory report as Excel

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
  "message": "User role 'staff' is not authorized"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "message": "Server error message"
}
```
