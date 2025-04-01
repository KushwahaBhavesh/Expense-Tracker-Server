 # Expense Tracker App

A full-stack expense tracking application built with React, Node.js, and MongoDB.

## Deployment Guide

### Prerequisites
- GitHub account
- MongoDB Atlas account
- Render account
- Netlify account

### Step 1: Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Set up database access:
   - Create a database user
   - Set password
   - Add IP address (0.0.0.0/0 for all IPs)
5. Get your connection string:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### Step 2: Backend Deployment (Render)

1. Go to [Render](https://render.com)
2. Create a free account
3. Connect your GitHub repository
4. Create a new Web Service
5. Select your backend repository
6. Configure the service:
   - Name: expense-tracker-backend
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
7. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your JWT secret key
   - `PORT`: 10000

### Step 3: Frontend Deployment (Netlify)

1. Go to [Netlify](https://netlify.com)
2. Create a free account
3. Connect your GitHub repository
4. Create a new site from Git
5. Select your frontend repository
6. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Add environment variables:
   - `VITE_API_URL`: Your Render backend URL

### Step 4: Update Frontend API URL

1. In your frontend code, update the API URL:
   ```javascript
   // client/src/utils/api.js
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
   ```

### Step 5: Final Configuration

1. Update CORS settings in backend:
   ```javascript
   // server/index.js
   app.use(cors({
     origin: ['https://your-netlify-app.netlify.app', 'http://localhost:5173'],
     credentials: true
   }));
   ```

2. Test the application:
   - Register a new user
   - Add some expenses
   - Verify all features work

### Important Notes

1. Free tier limitations:
   - MongoDB Atlas: 512MB storage
   - Render: 750 hours/month
   - Netlify: 100GB bandwidth/month

2. Security considerations:
   - Keep your environment variables secure
   - Regularly update dependencies
   - Monitor your usage

3. Maintenance:
   - Regularly backup your database
   - Monitor application logs
   - Update dependencies as needed

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   # Backend
   cd server
   npm install

   # Frontend
   cd client
   npm install
   ```

3. Create .env files:
   ```bash
   # server/.env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000

   # client/.env
   VITE_API_URL=http://localhost:5000
   ```

4. Start development servers:
   ```bash
   # Backend
   cd server
   npm run dev

   # Frontend
   cd client
   npm run dev
   ```

## Features

- User authentication
- Expense tracking
- Income tracking
- Category management
- Monthly summaries
- Currency support
- Data export
- Responsive design
- Dark mode support

## Technologies Used

- Frontend:
  - React
  - Tailwind CSS
  - Chart.js
  - React Router
  - Context API

- Backend:
  - Node.js
  - Express
  - MongoDB
  - JWT Authentication
  - Mongoose