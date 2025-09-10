# URL Shortener - Full Stack Application

A complete URL shortener application built with React (frontend), Express.js (backend), and MongoDB database. Features authentication, URL shortening, analytics, and API logging.

## Features

### Backend (Express.js + MongoDB)
- **Authentication System**: JWT-based user registration and login
- **URL Shortening**: Create short URLs with optional custom aliases
- **Analytics**: Track clicks, user agents, and referrer data
- **API Logging Middleware**: Comprehensive request/response logging
- **Security**: Helmet, CORS, rate limiting, input validation
- **Database Models**: User and URL models with relationships

### Frontend (React + Material UI)
- **Modern UI**: Clean, responsive design with Material UI components
- **Authentication Pages**: Login and registration forms
- **URL Shortener Page**: Create and manage shortened URLs
- **Statistics Page**: View analytics and performance metrics
- **Reusable Components**: UrlForm, UrlList, and Analytics components

## Project Structure

```
url-shortener-app/
├── Backend Test Submission/    # Backend Express.js application
│   ├── models/            # MongoDB models
│   │   ├── User.js        # User model with authentication
│   │   └── Url.js         # URL model with analytics
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication routes
│   │   ├── urls.js        # URL management routes
│   │   └── logs.js        # API logging routes
│   ├── middleware/        # Custom middleware
│   │   ├── auth.js        # JWT authentication middleware
│   │   └── logging.js     # Logging middleware integration
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── Frontend Test Submission/   # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   │   ├── UrlForm.js     # URL creation form
│   │   │   ├── UrlList.js     # URL management list
│   │   │   ├── Analytics.js   # Analytics dashboard
│   │   │   ├── Login.js       # Login form
│   │   │   ├── Register.js    # Registration form
│   │   │   ├── Navbar.js      # Navigation bar
│   │   │   └── LoadingSpinner.js
│   │   ├── pages/         # Main application pages
│   │   │   ├── UrlShortener.js  # Main URL shortener page
│   │   │   └── Statistics.js    # Analytics page
│   │   ├── contexts/      # React contexts
│   │   │   └── AuthContext.js   # Authentication context
│   │   ├── App.js         # Main app component
│   │   └── index.js       # React entry point
│   ├── public/
│   │   └── index.html     # HTML template
│   └── package.json       # Frontend dependencies
└── Logging Middleware/         # Reusable logging middleware package
    ├── index.js           # Main middleware implementation
    ├── package.json       # Middleware dependencies
    └── README.md          # Middleware documentation
```

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### URL Routes (`/api/urls`)
- `POST /shorten` - Create shortened URL
- `GET /my-urls` - Get user's URLs (paginated)
- `GET /stats/:shortId` - Get URL statistics
- `PUT /:shortId` - Update URL details
- `DELETE /:shortId` - Delete URL
- `GET /dashboard/stats` - Get dashboard statistics

### Logging Routes (`/api/logs`)
- `GET /` - Get API logs (filtered by user/admin)
- `GET /stats` - Get logging statistics
- `GET /:logId` - Get detailed log information

### URL Redirect
- `GET /:shortId` - Redirect to original URL (tracks analytics)

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd "Backend Test Submission"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   PORT=5002
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   BASE_URL=http://localhost:5002
   ```

4. Start the server:
   ```bash
   npm run dev  # Development with nodemon
   npm start    # Production
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd "Frontend Test Submission"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   PORT=3001 npm start
   ```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:5002

## Key Features Implemented

### 1. Authentication System
- JWT-based authentication with secure password hashing
- Protected routes and middleware
- User registration and login forms
- Persistent login state with localStorage

### 2. URL Shortening
- Generate short URLs with auto-generated or custom aliases
- URL validation and duplicate checking
- Optional descriptions and tags for organization
- Active/inactive status management

### 3. Analytics & Statistics
- Click tracking with timestamp, IP, and user agent
- Dashboard with key metrics (total URLs, clicks, etc.)
- Visual charts for click history
- Top performing URLs list

### 4. API Logging Middleware
- Comprehensive request/response logging
- Performance metrics (response time)
- Error tracking and categorization
- User-specific and admin-level log access

### 5. Modern Frontend
- Material UI components for consistent design
- Responsive layout for mobile and desktop
- Real-time updates and state management
- Intuitive user experience with loading states

## Security Features
- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- JWT token expiration and validation
- Password hashing with bcrypt

## Database Models

### User Model
- Authentication fields (email, password, name)
- Role-based access (user/admin)
- URL and click count tracking
- Account status management

### URL Model
- Original and shortened URL storage
- Click analytics and history
- User association and ownership
- Metadata (tags, description, status)
- Expiration and custom alias support

## Development Notes
- Backend uses Express.js with MongoDB and Mongoose
- Frontend uses React 18 with Material UI v5
- Authentication context provides global auth state
- Axios for API communication with interceptors
- Environment-based configuration for development/production

This application demonstrates a complete full-stack implementation with modern web development practices, security considerations, and user experience design.
