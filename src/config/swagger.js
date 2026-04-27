const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node.js BFF API',
      version: '2.0.0',
      description: `
## Backend for Frontend (BFF) API

A production-grade BFF service that aggregates multiple downstream microservices
into single, UI-optimised responses for React Micro Frontend (MFE) clients.

### Architecture
Instead of the React MFE making 3 separate API calls, this BFF aggregates them
in parallel (\`Promise.allSettled\`) and returns one composed payload.

### Auth Flow
1. \`POST /api/auth/login\` → get \`accessToken\`
2. Add header: \`Authorization: Bearer <accessToken>\`
3. Call any protected endpoint

### Test Credentials
| Email | Password | Role |
|-------|----------|------|
| alice@example.com | password123 | admin |
| bob@example.com | password123 | user |
      `,
      contact: {
        name: 'Mohamed Sadikul Ameen',
        url: 'https://portfolio-sadikameen.vercel.app',
        email: 's.mohamedsadikulameen@gmail.com',
      },
      license: { name: 'MIT' },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local development' },
      { url: 'https://sadik-bff-api.onrender.com', description: 'Production (Render)' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter the JWT token obtained from POST /api/auth/login',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success' },
            data: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Unauthorized' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'alice@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id:    { type: 'string', example: 'u1' },
                email: { type: 'string', example: 'alice@example.com' },
                role:  { type: 'string', enum: ['admin', 'user'], example: 'admin' },
                name:  { type: 'string', example: 'Alice Johnson' },
              },
            },
            accessToken:  { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id:     { type: 'string', example: 'u1' },
            name:   { type: 'string', example: 'Alice Johnson' },
            email:  { type: 'string', example: 'alice@example.com' },
            role:   { type: 'string', enum: ['admin', 'user'] },
            status: { type: 'string', enum: ['active', 'inactive'] },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id:       { type: 'string', example: 'o101' },
            status:   { type: 'string', enum: ['pending', 'shipped', 'delivered'], example: 'delivered' },
            amount:   { type: 'number', example: 250.00 },
            currency: { type: 'string', example: 'USD' },
            date:     { type: 'string', format: 'date', example: '2024-12-01' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id:      { type: 'string', example: 'n1' },
            type:    { type: 'string', example: 'order_update' },
            message: { type: 'string', example: 'Your order #o102 is being processed.' },
            read:    { type: 'boolean', example: false },
          },
        },
        DashboardResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            orders: {
              type: 'object',
              properties: {
                total:   { type: 'integer', example: 2 },
                pending: { type: 'integer', example: 1 },
                items:   { type: 'array', items: { $ref: '#/components/schemas/Order' } },
              },
            },
            notifications: {
              type: 'object',
              properties: {
                total:  { type: 'integer', example: 2 },
                unread: { type: 'integer', example: 1 },
                items:  { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
              },
            },
            meta: {
              type: 'object',
              properties: {
                aggregatedAt: { type: 'string', format: 'date-time' },
                elapsed_ms:   { type: 'integer', example: 65 },
              },
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Missing or invalid JWT token',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        Forbidden: {
          description: 'Insufficient permissions',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        NotFound: {
          description: 'Resource not found',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
      },
    },
    tags: [
      { name: 'Health',     description: 'Server health check' },
      { name: 'Auth',       description: 'JWT authentication — login, refresh, current user' },
      { name: 'Dashboard',  description: 'BFF aggregation endpoint — single call returns user + orders + notifications' },
      { name: 'Users',      description: 'User management (admin-only list, any authenticated user can get by ID)' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
