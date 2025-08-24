# JSG-Inspections Backend API

A robust and scalable backend system for the JSG-Inspections application, built with Node.js, TypeScript, Express.js, and SurrealDB.

## Features

- 🚀 **High Performance**: Built with Express.js and TypeScript for optimal performance
- 🗄️ **SurrealDB Integration**: Modern multi-model database with real-time capabilities
- 🔐 **JWT Authentication**: Secure authentication with refresh token strategy
- 📱 **Real-time Updates**: WebSocket support for live data synchronization
- 🤖 **AI Integration**: Computer vision and NLP capabilities for intelligent inspections
- 📊 **Comprehensive API**: RESTful endpoints for all inspection management features
- 🔒 **Security First**: Helmet, CORS, rate limiting, and input validation
- 📝 **API Documentation**: Auto-generated Swagger documentation
- 🧪 **Testing**: Comprehensive test suite with Jest and Supertest
- 📦 **File Handling**: Image upload and processing with Sharp
- 🔄 **Offline Sync**: Robust synchronization for offline-first applications

## Technology Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.1+
- **Framework**: Express.js 4.18+
- **Database**: SurrealDB Embedded
- **Authentication**: JWT with refresh tokens
- **Real-time**: Socket.io WebSocket
- **AI**: OpenAI API, TensorFlow.js
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI 3.0

## Quick Start

### Prerequisites

- Node.js 20.0.0 or higher
- npm 9.0.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jsg-inspections/backend
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

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_PATH=./data/jsg_inspections.db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# AI Integration (Optional)
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
```

## API Documentation

Once the server is running, visit:
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## Project Structure

```
src/
├── controllers/          # Request handlers
├── services/            # Business logic layer
├── models/              # Data models and types
├── middleware/          # Custom middleware
├── routes/              # API route definitions
├── database/            # Database connection and queries
├── utils/               # Utility functions
├── config/              # Configuration management
└── types/               # TypeScript type definitions
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run build:watch` - Build with watch mode
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run docs` - Generate API documentation

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

### Users
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Assets
- `GET /api/v1/assets` - Get all assets
- `POST /api/v1/assets` - Create new asset
- `GET /api/v1/assets/:id` - Get asset by ID
- `PUT /api/v1/assets/:id` - Update asset
- `DELETE /api/v1/assets/:id` - Delete asset

### Inspections
- `GET /api/v1/inspections` - Get all inspections
- `POST /api/v1/inspections` - Create new inspection
- `GET /api/v1/inspections/:id` - Get inspection by ID
- `PUT /api/v1/inspections/:id` - Update inspection
- `POST /api/v1/inspections/:id/complete` - Complete inspection

### Reports
- `GET /api/v1/reports` - Get all reports
- `POST /api/v1/reports/generate` - Generate new report
- `GET /api/v1/reports/:id` - Get report by ID
- `GET /api/v1/reports/:id/download` - Download report PDF

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request rate limiting
- **Input Validation**: Request validation with Joi
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password hashing
- **File Upload Security**: Secure file upload handling

## Performance Optimizations

- **Compression**: Gzip compression for responses
- **Caching**: In-memory caching for frequently accessed data
- **Database Optimization**: Efficient SurrealDB queries
- **Request Timeout**: Configurable request timeouts
- **Memory Management**: Optimized memory usage

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure the following environment variables are set:

- `NODE_ENV=production`
- `JWT_SECRET` (minimum 32 characters)
- `JWT_REFRESH_SECRET` (minimum 32 characters)
- Database configuration
- AI API keys (if using AI features)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the repository.