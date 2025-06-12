# Gamecity - Gaming Store Application

A full-stack gaming store application built with React (frontend) and Node.js Express (backend), featuring MongoDB Atlas integration with demo mode fallback.

## 🚀 Features

- **Modern React Frontend**: Built with TypeScript, Tailwind CSS, and Vite
- **Node.js Express Backend**: RESTful API with MongoDB Atlas integration
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Demo Mode**: Works without database connection using demo data
- **Product Management**: Full CRUD operations for gaming products
- **User Management**: User registration, login, and profile management
- **Admin Dashboard**: Administrative interface for managing products and users
- **Responsive Design**: Mobile-friendly interface with dark theme
- **Shopping Cart**: Persistent cart functionality with localStorage

## 🏗️ Architecture

```
gamecity/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth, Cart)
│   │   ├── services/       # API services
│   │   └── lib/           # Utilities and configurations
│   └── package.json
├── backend/                 # Node.js Express API
│   ├── routes/             # API route handlers
│   │   ├── auth.js        # Authentication routes
│   │   ├── products.js    # Product management routes
│   │   └── users.js       # User management routes
│   ├── server.js          # Main server file
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Radix UI** for accessible components

### Backend

- **Node.js** with Express
- **MongoDB** with native driver
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (optional - works in demo mode without it)

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd gamecity

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Setup

**Frontend (.env):**

```env
VITE_BACKEND_URL=http://localhost:5000/api
```

**Backend (backend/.env):**

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=gamecity-store
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 3. Start the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔐 Demo Accounts

When running in demo mode (without MongoDB), use these accounts:

| Email                | Password | Role  |
| -------------------- | -------- | ----- |
| admin@greenbits.com  | password | Admin |
| hussenito7@gmail.com | password | User  |
| test@example.com     | password | User  |
| customer@demo.com    | password | User  |

## 📊 Database Setup (Optional)

### MongoDB Atlas Configuration

1. **Create MongoDB Atlas Account**

   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster

2. **Get Connection String**

   - Go to Database → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database password

3. **Configure Backend**

   - Update `backend/.env` with your MongoDB URI
   - Restart the backend server

4. **Verify Connection**
   - Check the System Status in the app
   - Should show "MongoDB Connected" instead of "Demo Mode"

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/reset-password` - Password reset

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Users

- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)

### Health Check

- `GET /api/health` - Server and database status

## 🎮 Usage

### Customer Features

1. **Browse Products**: View gaming products with categories and search
2. **Shopping Cart**: Add products to cart with persistent storage
3. **User Account**: Register, login, and manage profile
4. **Product Details**: View detailed product information and reviews

### Admin Features

1. **Product Management**: Create, edit, and delete products
2. **User Management**: View and manage user accounts
3. **Dashboard**: Overview of system status and statistics

## 🔄 Demo Mode vs Production Mode

### Demo Mode (Default)

- Works without database connection
- Uses hardcoded demo data (5 products, 4 users)
- Authentication works with demo accounts
- Cart persists in localStorage
- Perfect for development and testing

### Production Mode (with MongoDB Atlas)

- Real database persistence
- User registration creates actual accounts
- Product management affects real data
- Scalable for production use

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Vercel)

1. Set environment variables on your platform
2. Ensure MongoDB Atlas is accessible
3. Deploy the `backend` directory

### Frontend Deployment (Vercel/Netlify)

1. Update `VITE_BACKEND_URL` to your deployed backend URL
2. Build and deploy the frontend

### Environment Variables for Production

```env
# Backend
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-secure-production-secret
NODE_ENV=production

# Frontend
VITE_BACKEND_URL=https://your-backend-domain.com/api
```

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **CORS Configuration**: Controlled cross-origin access
- **Input Validation**: Server-side validation
- **Admin Protection**: Role-based access control

## 🧪 Development

### Available Scripts

**Frontend:**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend:**

- `npm run dev` - Start with nodemon (auto-restart)
- `npm start` - Start production server

### Project Structure Details

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── Layout.tsx       # Main layout wrapper
│   ├── Navbar.tsx       # Navigation component
│   └── DebugInfo.tsx    # System status display
├── contexts/
│   ├── AuthContext.tsx  # Authentication state
│   └── CartContext.tsx  # Shopping cart state
├── pages/
│   ├── Home.tsx         # Landing page
│   ├── SignIn.tsx       # Login page
│   ├── SignUp.tsx       # Registration page
│   ├── Profile.tsx      # User profile
│   └── Admin.tsx        # Admin dashboard
├── services/
│   ├── backendService.ts     # Backend API client
│   └── atlasProductService.ts # Product service wrapper
└── lib/
    └── utils.ts         # Utility functions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Backend won't start:**

- Check if port 5000 is available
- Verify Node.js version (18+)
- Check environment variables

**Frontend can't connect to backend:**

- Verify backend is running on port 5000
- Check CORS configuration
- Verify `VITE_BACKEND_URL` in .env

**Database connection issues:**

- Verify MongoDB Atlas connection string
- Check network access in Atlas
- Ensure database user has proper permissions

**Authentication not working:**

- Check JWT_SECRET is set
- Verify token storage in browser
- Check browser console for errors

### Getting Help

1. Check the browser console for errors
2. Check the backend server logs
3. Use the System Status component to verify connections
4. Review the API documentation above

## 🎯 Future Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] Order management system
- [ ] Product reviews and ratings
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] Inventory management
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

---

**Built with ❤️ for the gaming community**
