# RentEz - Property Rental & Management Platform

<div align="center">
  <h3>🏠 Connecting Property Owners and Tenants Seamlessly</h3>
  <p>A full-stack MERN application for property rental and management with advanced features</p>
</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)

---

## ✨ Features

### For Property Owners
- ✅ **Property Management**: Add, edit, and delete property listings with multiple images
- ✅ **Owner Dashboard**: View all properties with profile section and quick stats
- ✅ **Application Management**: Review and approve/reject tenant applications
- ✅ **Lease Management**: Create and manage rental agreements
- ✅ **Payment Tracking**: Monitor rent payments with receipt verification
- ✅ **Analytics Dashboard**: Revenue trends, occupancy rates, property performance metrics with interactive charts
- ✅ **Review Responses**: Respond to tenant reviews and build credibility
- ✅ **Real-time Chat**: Communicate with potential and current tenants

### For Tenants
- ✅ **Property Search**: Browse and filter properties by location, price, bedrooms, etc.
- ✅ **Interactive Maps**: View property locations with Mapbox integration
- ✅ **Application System**: Apply for properties with document uploads
- ✅ **Tenant Dashboard**: View active leases and payment history with profile section
- ✅ **Payment Management**: Upload payment receipts and track payment status
- ✅ **Reviews & Ratings**: Write detailed reviews with photos, pros/cons, and star ratings
- ✅ **Real-time Chat**: Message property owners directly
- ✅ **Automated Reminders**: Receive monthly rent reminders via email

### Advanced Features
- ⭐ **Reviews & Ratings System**
  - Verified tenant reviews only
  - 5-star rating system
  - Photo uploads (up to 5 per review)
  - Pros and cons lists
  - Owner responses
  - Helpful votes
  - Rating statistics and distribution

- 📊 **Analytics Dashboard**
  - Revenue trends with interactive charts (Recharts)
  - Occupancy rate tracking
  - Payment distribution visualization
  - Property performance metrics
  - Collection rate analysis
  - Time range filtering (3/6/12 months)

- 🔐 **Security & Authentication**
  - JWT-based authentication
  - Role-based access control (Owner/Tenant)
  - Protected routes and API endpoints
  - Secure file uploads

---

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **Multer** - File upload handling

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.io Client** - Real-time messaging
- **Mapbox GL** - Interactive maps
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **date-fns** - Date formatting

---

## 📂 Project Structure

```
RentEz/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── StarRating.jsx
│   │   │   ├── ReviewCard.jsx
│   │   │   ├── ReviewForm.jsx
│   │   │   ├── ReviewStats.jsx
│   │   │   ├── ReviewList.jsx
│   │   │   ├── AnalyticsCard.jsx
│   │   │   ├── RevenueChart.jsx
│   │   │   ├── PaymentStatusChart.jsx
│   │   │   └── ...
│   │   ├── pages/          # Page components
│   │   │   ├── PropertyDetails.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── OwnerDashboard.jsx
│   │   │   ├── TenantDashboard.jsx
│   │   │   └── ...
│   │   ├── context/        # Context providers
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Backend Express application
│   ├── config/             # Configuration files
│   │   ├── db.js
│   │   └── socket.js
│   ├── controllers/        # Route controllers
│   │   ├── reviewController.js
│   │   ├── analyticsController.js
│   │   ├── rentController.js
│   │   └── ...
│   ├── models/             # Mongoose models
│   │   ├── Review.js
│   │   ├── Property.js
│   │   ├── RentPayment.js
│   │   ├── Lease.js
│   │   └── ...
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js
│   │   └── upload.js
│   ├── routes/             # API routes
│   │   ├── reviews.js
│   │   ├── analytics.js
│   │   ├── properties.js
│   │   └── ...
│   ├── uploads/            # Uploaded files
│   ├── server.js           # Entry point
│   └── package.json
│
├── .gitignore
├── package.json            # Root package.json
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd RentEz
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. **Configure environment variables**

Create `.env` file in the `server` directory:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# Client URL
CLIENT_URL=http://localhost:5173

# Email (for rent reminders)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Mapbox (optional)
MAPBOX_TOKEN=your_mapbox_token
```

Create `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_MAPBOX_TOKEN=your_mapbox_token
```

---

## 🏃 Running the Application

### Development Mode

#### Option 1: Run both client and server together (Recommended)
```bash
# From the root directory
npm run dev
```

#### Option 2: Run separately
```bash
# Terminal 1 - Start backend server
cd server
npm start

# Terminal 2 - Start frontend client
cd client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

### Production Build

```bash
# Build frontend
cd client
npm run build

# Start backend in production mode
cd ../server
npm start
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register a new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |

### Property Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/properties` | Get all properties (with filters) | No |
| GET | `/api/properties/:id` | Get single property | No |
| POST | `/api/properties` | Create new property | Yes (Owner) |
| PUT | `/api/properties/:id` | Update property | Yes (Owner) |
| DELETE | `/api/properties/:id` | Delete property | Yes (Owner) |
| GET | `/api/properties/owner/my-properties` | Get owner's properties | Yes (Owner) |

### Application Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/applications` | Submit property application | Yes (Tenant) |
| GET | `/api/applications/my-applications` | Get tenant's applications | Yes (Tenant) |
| GET | `/api/applications/received` | Get received applications | Yes (Owner) |
| PUT | `/api/applications/:id/status` | Update application status | Yes (Owner) |

### Lease Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/leases` | Create new lease | Yes (Owner) |
| GET | `/api/leases/active` | Get active leases | Yes |
| GET | `/api/leases/:id` | Get lease details | Yes |
| PUT | `/api/leases/:id/terminate` | Terminate lease | Yes (Owner) |

### Rent Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/rent/tenant` | Get tenant's payments | Yes (Tenant) |
| GET | `/api/rent/owner` | Get owner's payments | Yes (Owner) |
| POST | `/api/rent` | Create rent payment | Yes (Owner) |
| PUT | `/api/rent/:id` | Update payment status | Yes |
| POST | `/api/rent/:id/upload-proof` | Upload payment receipt | Yes (Tenant) |
| PUT | `/api/rent/:id/verify-receipt` | Verify payment receipt | Yes (Owner) |

### Analytics Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/owner/overview` | Get owner analytics overview | Yes (Owner) |
| GET | `/api/analytics/owner/revenue` | Get revenue breakdown | Yes (Owner) |
| GET | `/api/analytics/owner/properties` | Get property performance | Yes (Owner) |

### Review Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/reviews` | Create review | Yes (Tenant) |
| GET | `/api/reviews/property/:propertyId` | Get property reviews | No |
| PUT | `/api/reviews/:id` | Update review | Yes (Author) |
| DELETE | `/api/reviews/:id` | Delete review | Yes (Author) |
| POST | `/api/reviews/:id/helpful` | Mark review helpful | Yes |
| POST | `/api/reviews/:id/response` | Add owner response | Yes (Owner) |
| GET | `/api/reviews/my-reviews` | Get my reviews | Yes (Tenant) |

### Chat Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/chat/conversations` | Get all conversations | Yes |
| GET | `/api/chat/:userId` | Get messages with user | Yes |
| PUT | `/api/chat/:userId/seen` | Mark messages as seen | Yes |

---

## 🎯 Key Highlights

### Reviews & Ratings
- Only verified tenants (with active/completed leases) can review
- 5-star rating system with detailed feedback
- Upload up to 5 photos per review
- Add pros and cons lists
- Owner response capability
- Helpful vote system
- Automatic rating calculations

### Analytics Dashboard
- Real-time revenue tracking
- Interactive charts (line/bar toggle)
- Occupancy rate monitoring
- Payment distribution visualization
- Property performance comparison
- Time range filtering (3/6/12 months)

### Payment Management
- Receipt upload (images/PDFs up to 10MB)
- Owner verification workflow
- Approval/rejection with notes
- Complete payment history
- Status tracking (pending, paid, overdue)

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Developer

Built with ❤️ using the MERN stack

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Happy Renting! 🏠**
