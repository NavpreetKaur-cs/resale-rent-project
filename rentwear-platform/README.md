# ReVogue - Clothing Rental and Resale Platform

A modern web platform for renting and reselling clothing sustainably.

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   - Copy `.env` file and update the values:
     ```
     MONGO_URI=mongodb://localhost:27017/revogue
     JWT_SECRET=your_secure_jwt_secret_here
     ```
   - For MongoDB Atlas (cloud): Use connection string from your Atlas cluster
   - For local MongoDB: Install MongoDB and use `mongodb://localhost:27017/revogue`

3. **Database Setup:**
   - **Local MongoDB:** Install MongoDB Community Server and start it
   - **MongoDB Atlas:** Create a free cluster and get the connection string
   - Update `MONGO_URI` in `.env` file

3. **Start MongoDB:**
   - Make sure MongoDB is running locally or use MongoDB Atlas

4. **Start the Server:**
   ```bash
   npm run dev  # For development with nodemon
   # or
   npm start    # For production
   ```

5. **Access the Application:**
   - Open `http://localhost:5000` in your browser

## Features

- User authentication (register/login)
- Browse and rent clothing (ethnic/wedding categories)
- Browse and purchase resale items
- Add items for sale/rental
- User profiles with reward points and wallet
- Order management

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Clothing
- `GET /api/clothing` - Get all clothing items
- `GET /api/clothing/:id` - Get single item
- `POST /api/clothing` - Add new item (protected)
- `PUT /api/clothing/:id` - Update item (protected, seller only)
- `DELETE /api/clothing/:id` - Delete item (protected, seller only)

### Orders
- `POST /api/orders` - Place order (protected)
- `GET /api/orders/my-orders` - Get user orders (protected)
- `PUT /api/orders/:id/status` - Update order status (protected)

## Technologies Used

- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT, bcryptjs
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Other:** CORS, dotenv