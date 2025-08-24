# JSG-Inspections Backend API Documentation

## Overview

The JSG-Inspections Backend API is a comprehensive RESTful API built with Node.js, TypeScript, and Express.js. It provides complete inspection management capabilities with real-time features, AI integration, and offline synchronization support.

## Quick Start

### Prerequisites

- Node.js 20+
- SurrealDB
- TypeScript 5.1+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd JSG-Inspection/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start SurrealDB
surreal start --log trace --user root --pass root memory

# Run database migrations
npm run db:migrate

# Start the development server
npm run dev
```

### API Documentation

Once the server is running, you can access the interactive API documentation at:

- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/docs/openapi.json
- **OpenAPI YAML**: http://localhost:3000/docs/openapi.yaml

## Authentication

### JWT Bearer Token

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Getting Started

1. **Register a new user**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "John",
       "lastName": "Doe",
       "email": "john.doe@example.com",
       "password": "SecurePassword123!",
       "role": "inspector"
     }'
   ```

2. **Login to get access token**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "john.doe@example.com",
       "password": "SecurePassword123!"
     }'
   ```

3. **Use the token for authenticated requests**:
   ```bash
   curl -X GET http://localhost:3000/api/v1/users/me \
     -H "Authorization: Bearer <your-access-token>"
   ```

## API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | User login |
| POST | `/register` | User registration |
| POST | `/refresh` | Refresh access token |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset password |
| POST | `/verify-email` | Verify email address |
| POST | `/resend-verification` | Resend verification email |
| POST | `/logout` | Logout current session |
| POST | `/logout-all` | Logout all sessions |

### Users (`/api/v1/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me` | Get current user profile |
| PUT | `/me` | Update current user profile |
| POST | `/me/change-password` | Change password |
| PUT | `/me/preferences` | Update user preferences |
| GET | `/me/sessions` | Get user sessions |
| GET | `/` | Get all users (admin) |
| POST | `/` | Create new user (admin) |
| GET | `/:id` | Get user by ID |
| PUT | `/:id` | Update user |
| DELETE | `/:id` | Delete user |

### Assets (`/api/v1/assets`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all assets |
| POST | `/` | Create new asset |
| GET | `/:id` | Get asset by ID |
| PUT | `/:id` | Update asset |
| DELETE | `/:id` | Delete asset |
| GET | `/qr/:qrCode` | Get asset by QR code |
| POST | `/:id/photos` | Upload asset photos |
| GET | `/:id/inspections` | Get asset inspections |
| GET | `/:id/maintenance` | Get maintenance records |

### Inspections (`/api/v1/inspections`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all inspections |
| POST | `/` | Create new inspection |
| GET | `/:id` | Get inspection by ID |
| PUT | `/:id` | Update inspection |
| DELETE | `/:id` | Delete inspection |
| POST | `/:id/complete` | Complete inspection |
| POST | `/:id/photos` | Upload inspection photos |
| GET | `/:id/report` | Generate inspection report |

### Forms (`/api/v1/forms`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all form templates |
| POST | `/` | Create new form template |
| GET | `/:id` | Get form template by ID |
| PUT | `/:id` | Update form template |
| DELETE | `/:id` | Delete form template |
| POST | `/:id/duplicate` | Duplicate form template |

### Folders (`/api/v1/folders`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all folders |
| POST | `/` | Create new folder |
| GET | `/:id` | Get folder by ID |
| PUT | `/:id` | Update folder |
| DELETE | `/:id` | Delete folder |
| GET | `/:id/inspections` | Get folder inspections |

### Reports (`/api/v1/reports`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate` | Generate custom report |
| GET | `/templates` | Get report templates |
| GET | `/:id` | Get report by ID |
| GET | `/:id/download` | Download report |

### Synchronization (`/api/v1/sync`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload offline data |
| GET | `/download` | Download updates |
| GET | `/status` | Get sync status |
| POST | `/resolve-conflicts` | Resolve sync conflicts |

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **File upload endpoints**: 10 requests per minute
- **Report generation**: 5 requests per minute

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

## WebSocket Events

Real-time features are available via WebSocket connection:

### Connection

```javascript
const socket = io('ws://localhost:3000');

// Authenticate after connection
socket.emit('authenticate', { token: 'your-jwt-token' });
```

### Events

| Event | Description | Payload |
|-------|-------------|----------|
| `inspection:created` | New inspection created | `{ inspection }` |
| `inspection:updated` | Inspection updated | `{ inspection }` |
| `inspection:completed` | Inspection completed | `{ inspection }` |
| `asset:updated` | Asset updated | `{ asset }` |
| `notification` | New notification | `{ notification }` |
| `system:alert` | System alert | `{ alert }` |

### Subscribing to Updates

```javascript
// Subscribe to inspection updates
socket.emit('subscribe:inspection', { inspectionId: 'inspection:123' });

// Subscribe to asset updates
socket.emit('subscribe:asset', { assetId: 'asset:456' });

// Listen for updates
socket.on('inspection:updated', (data) => {
  console.log('Inspection updated:', data.inspection);
});
```

## File Uploads

### Image Upload

```bash
curl -X POST http://localhost:3000/api/v1/inspections/123/photos \
  -H "Authorization: Bearer <token>" \
  -F "photos=@image1.jpg" \
  -F "photos=@image2.jpg"
```

### Supported Formats

- **Images**: JPEG, PNG, WebP
- **Documents**: PDF
- **Max file size**: 10MB per file
- **Max files per request**: 10

## Pagination

List endpoints support pagination:

```bash
curl "http://localhost:3000/api/v1/inspections?page=2&limit=20"
```

### Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

## Filtering and Searching

### Search

```bash
curl "http://localhost:3000/api/v1/assets?search=pump"
```

### Filtering

```bash
curl "http://localhost:3000/api/v1/inspections?status=completed&priority=high"
```

### Sorting

```bash
curl "http://localhost:3000/api/v1/assets?sortBy=name&sortOrder=asc"
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

### Generating Documentation

```bash
# Generate API documentation
npm run docs

# Validate OpenAPI specification
npm run docs:validate
```

### Database Operations

```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database
npm run db:reset
```

## Production Deployment

### Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DB_URL=ws://localhost:8000/rpc
DB_NAMESPACE=jsg_inspections
DB_DATABASE=production
DB_USER=admin
DB_PASS=secure_password

# Authentication
JWT_SECRET=your-super-secure-jwt-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# AI Services
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
```

### Docker Deployment

```bash
# Build image
docker build -t jsg-inspections-backend .

# Run container
docker run -d \
  --name jsg-backend \
  -p 3000:3000 \
  -e NODE_ENV=production \
  jsg-inspections-backend
```

## Support

For support and questions:

- **Documentation**: http://localhost:3000/api-docs
- **Issues**: Create an issue in the repository
- **Email**: support@jsg-inspections.com

## License

This project is licensed under the MIT License.