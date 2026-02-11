<<<<<<< HEAD
# Amrit Sagar Backend

A robust Node.js/Express backend API for the Amrit Sagar Ashram Retreat website, providing comprehensive functionality for managing contacts, bookings, and administrative operations.

## 🚀 Features

### Core Functionality
- **Contact Management**: Handle contact form submissions with email notifications
- **Booking System**: Complete booking management with availability checking
- **User Authentication**: JWT-based authentication with role-based access control
- **Email Service**: Automated email notifications and confirmations
- **Admin Panel**: Administrative dashboard with analytics
- **API Documentation**: RESTful API with comprehensive endpoints

### Security Features
- JWT authentication with refresh tokens
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet
- Password hashing with bcrypt

### Data Management
- MongoDB with Mongoose ODM
- Data validation and schema enforcement
- Relationship management
- Indexing for performance
- Soft deletes and audit trails

## 📋 Requirements

- Node.js 16.0 or higher
- MongoDB 4.0 or higher
- NPM or Yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd amrit-sagar-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

5. **Seed database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📁 Project Structure

```
amrit-sagar-backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── contactController.js  # Contact form handling
│   └── bookingController.js # Booking management
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── errorHandler.js     # Error handling
├── models/
│   ├── Contact.js           # Contact model
│   ├── Booking.js           # Booking model
│   └── User.js              # User model
├── routes/
│   ├── api.js              # General API routes
│   ├── admin.js            # Admin routes
│   ├── bookings.js         # Booking routes
│   ├── contact.js          # Contact routes
│   └── pages.js            # Page metadata routes
├── scripts/
│   └── seedDatabase.js     # Database seeding
├── utils/
│   └── emailService.js     # Email functionality
├── .env.example              # Environment variables template
├── package.json              # Dependencies and scripts
├── server.js                # Main server file
└── README.md                # This file
```

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/amrit-sagar

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FROM_EMAIL=noreply@amritsagar.org

# Admin
ADMIN_EMAIL=admin@amritsagar.org
ADMIN_PASSWORD=admin123
```

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication
All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Public Routes

**Contact**
- `POST /api/contact` - Submit contact form
- `GET /api/contact/stats` - Get contact statistics

**Bookings**
- `POST /api/bookings` - Create new booking
- `POST /api/bookings/check-availability` - Check availability
- `PUT /api/bookings/:id/cancel` - Cancel booking

**Pages**
- `GET /api/pages` - Get all page metadata
- `GET /api/pages/:page` - Get specific page metadata

**General**
- `GET /api` - API information
- `GET /api/health` - Health check

#### Protected Routes (Admin)

**Contact Management**
- `GET /api/contact` - Get all contacts
- `GET /api/contact/:id` - Get single contact
- `PUT /api/contact/:id` - Update contact
- `DELETE /api/contact/:id` - Delete contact

**Booking Management**
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get single booking
- `PUT /api/bookings/:id` - Update booking

**Admin**
- `GET /api/admin/dashboard` - Dashboard data
- `GET /api/admin/settings` - System settings
- `PUT /api/admin/settings` - Update settings

## 📧 Email Templates

The system includes automated email templates for:
- Contact form notifications
- Auto-reply to contact submissions
- Booking confirmations
- Booking status updates
- Booking cancellations

## 🔐 Security Features

- **Authentication**: JWT-based with expiration
- **Authorization**: Role-based access control
- **Rate Limiting**: Prevents abuse and DDoS
- **Input Validation**: Comprehensive validation rules
- **CORS**: Configured for production domains
- **Security Headers**: Helmet middleware
- **Password Security**: bcrypt hashing with salt

## 📊 Data Models

### User Model
```javascript
{
  username: String,
  email: String,
  password: String,
  role: ['admin', 'staff', 'manager'],
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    avatar: String,
    bio: String,
    department: String
  },
  permissions: [String],
  isActive: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date
}
```

### Contact Model
```javascript
{
  name: String,
  email: String,
  phone: String,
  subject: String,
  message: String,
  source: String,
  status: ['pending', 'in-progress', 'resolved', 'closed'],
  priority: ['low', 'medium', 'high', 'urgent'],
  assignedTo: String,
  notes: [{
    content: String,
    author: String,
    timestamp: Date
  }],
  ipAddress: String,
  userAgent: String
}
```

### Booking Model
```javascript
{
  personalInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    country: String,
    emergencyContact: Object
  },
  program: {
    type: String,
    name: String,
    duration: Number,
    startDate: Date,
    endDate: Date,
    participants: {
      adults: Number,
      children: Number
    },
    experience: String
  },
  accommodation: {
    type: String,
    checkIn: Date,
    checkOut: Date,
    specialNeeds: String
  },
  payment: {
    status: String,
    amount: Number,
    currency: String,
    method: String,
    transactionId: String,
    paidAt: Date
  },
  status: ['inquiry', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'],
  source: String,
  notes: [Object]
}
```

## 🚀 Deployment

### Production Setup

1. **Environment variables**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb://your-production-db
   JWT_SECRET=your-production-secret
   ```

2. **Build and start**
   ```bash
   npm install --production
   npm start
   ```

3. **Process Manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "amrit-sagar-api"
   ```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Logs
```bash
# Development logs
npm run dev

# Production logs
pm2 logs amrit-sagar-api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@amritsagar.org
- Documentation: [API Docs](https://github.com/amrit-sagar/backend/docs)
- Issues: [GitHub Issues](https://github.com/amrit-sagar/backend/issues)

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added booking system and email notifications
- **v1.2.0** - Enhanced security and admin panel
- **v1.3.0** - Added analytics and reporting

---

Built with ❤️ for Amrit Sagar Ashram Retreat
=======

>>>>>>> 93e0758f2e7f637c1fec2451f6ac0ee2225771fd
