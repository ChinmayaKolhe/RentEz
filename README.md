# RentEz - Property Rental & Management Platform

<div align="center">
  <h3>🏠 Connecting Property Owners and Tenants Seamlessly</h3>
  <p>A full-stack MERN application for property rental and management</p>
</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)

---

## ✨ Features

### For Property Owners
- ✅ Add, edit, and delete property listings
- ✅ Upload multiple property images (Cloudinary integration)
- ✅ Dashboard to view all listed properties
- ✅ Manage rent payment history for tenants
- ✅ Real-time chat with potential tenants

### For Tenants
- ✅ Browse and filter properties by location, price, bedrooms, etc.
- ✅ View property details with interactive maps (Mapbox)
- ✅ Real-time chat with property owners
- ✅ Track rent payment status
- ✅ Receive automated monthly rent reminders via email

### General Features
- ✅ JWT-based authentication
- ✅ Role-based access control (Owner/Tenant)
- ✅ Real-time messaging with Socket.io
- ✅ Automated email reminders with Nodemailer
- ✅ Responsive design with Tailwind CSS
- ✅ Interactive property location maps

---

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **Cloudinary** - Image storage
- **Nodemailer** - Email service
- **node-cron** - Scheduled tasks

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.io Client** - Real-time messaging
- **Mapbox GL** - Interactive maps
- **Lucide React** - Icons

---

## 📂 Project Structure

```
RentEz/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
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
│   ├── controllers/        # Route controllers
│   ├── models/             # Mongoose models
│   ├── middleware/         # Custom middleware
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
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
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Step 1: Clone the repository
```bash
git clone <repository-url>
cd RentEz
```

### Step 2: Install dependencies
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

---

## ⚙️ Configuration

### Backend Configuration

1. Create a `.env` file in the `server` directory:
```bash
cd server
cp .env.example .env
```

2. Update the `.env` file with your credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/rentez
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rentez

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=RentEz <noreply@rentez.com>

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Frontend Configuration

1. Create a `.env` file in the `client` directory:
```bash
cd client
cp .env.example .env
```

2. Update the `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_MAPBOX_TOKEN=your_mapbox_access_token_here
VITE_SOCKET_URL=http://localhost:5000
```

### Getting API Keys

#### Cloudinary
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from the dashboard

#### Mapbox
1. Sign up at [mapbox.com](https://mapbox.com)
2. Create an access token from your account dashboard

#### Gmail (for Nodemailer)
1. Enable 2-factor authentication on your Google account
2. Generate an App Password from [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

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
npm run dev

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

### Rent Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/rent/tenant` | Get tenant's payments | Yes (Tenant) |
| GET | `/api/rent/owner` | Get owner's payments | Yes (Owner) |
| POST | `/api/rent` | Create rent payment | Yes (Owner) |
| PUT | `/api/rent/:id` | Update payment status | Yes |
| GET | `/api/rent/stats` | Get payment statistics | Yes |

### Chat Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/chat/conversations` | Get all conversations | Yes |
| GET | `/api/chat/:userId` | Get messages with user | Yes |
| PUT | `/api/chat/:userId/seen` | Mark messages as seen | Yes |

---

## 🎨 Screenshots

> Add screenshots of your application here

---

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or check your Atlas connection string
   - Verify network access in MongoDB Atlas

2. **Cloudinary Upload Fails**
   - Verify your Cloudinary credentials in `.env`
   - Check file size limits (default: 5MB)

3. **Email Not Sending**
   - Verify Gmail App Password is correct
   - Check if 2FA is enabled on your Google account

4. **Map Not Displaying**
   - Verify Mapbox token in client `.env`
   - Check browser console for errors

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

Built with ❤️ using the MERN stack

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## ⭐ Show your support

Give a ⭐️ if you like this project!
