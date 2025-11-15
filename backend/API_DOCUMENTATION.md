# T8D Backend API Documentation

## Overview

The T8D Sync Server provides a RESTful API for synchronizing task data across devices. The API uses JWT-based authentication and follows REST conventions.

**Base URL**: `http://localhost:3000/api/v1`

**Production URL**: `https://your-domain.com/api/v1`

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Synchronization](#synchronization)
4. [Real-time Updates](#real-time-updates)
5. [Error Handling](#error-handling)
6. [Data Models](#data-models)

---

## Authentication

All authenticated endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Register

Create a new user account.

**Endpoint**: `POST /auth/register`

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "your-secure-password-min-12-chars",
  "name": "John Doe" // Optional
}
```

**Validation Rules**:

- Email: Valid email format
- Password: Minimum 12 characters, strength score >= 3 (zxcvbn)
- Name: Optional, HTML tags will be stripped

**Success Response** (201):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Error Responses**:

```json
// 409 Conflict - User already exists
{
  "status": 409,
  "message": "User already exists"
}

// 400 Bad Request - Validation error
{
  "issues": [
    {
      "code": "too_small",
      "minimum": 12,
      "message": "Password must be at least 12 characters long",
      "path": ["password"]
    }
  ]
}
```

---

### Login

Authenticate and receive a JWT token.

**Endpoint**: `POST /auth/login`

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "your-secure-password"
}
```

**Success Response** (200):

```json
{
  "message": "Login Successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Token Expiration**: 30 days

**Error Responses**:

```json
// 401 Unauthorized - Invalid credentials
{
  "status": 401,
  "message": "Invalid credentials"
}
```

---

### Logout

Log out the current user (client-side token removal).

**Endpoint**: `POST /auth/logout`

**Authentication**: Required

**Success Response** (200):

```json
{
  "message": "Logout successful"
}
```

---

## User Management

### Edit User

Update user profile information.

**Endpoint**: `PATCH /user/edit`

**Authentication**: Required

**Request Body**:

```json
{
  "name": "Jane Doe", // Optional
  "password": "new-secure-password-min-12-chars" // Optional
}
```

**Validation Rules**:

- At least one field (name or password) must be provided
- Password: Same rules as registration if provided
- Name: HTML tags will be stripped

**Success Response** (200):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "Jane Doe",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T11:45:00.000Z"
}
```

---

## Synchronization

### Sync Status

Check sync service status.

**Endpoint**: `GET /sync`

**Authentication**: Required

**Success Response** (200):

```json
{
  "message": "Sync service is online",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com"
}
```

---

### Bootstrap

Get all user data for initial sync.

**Endpoint**: `GET /sync/bootstrap`

**Authentication**: Required

**Success Response** (200):

```json
{
  "timestamp": "2025-01-15T12:00:00.000Z",
  "lists": [
    {
      "id": "list-uuid-1",
      "name": "Personal Tasks",
      "description": "My personal task list",
      "lastModified": "2025-01-15T10:00:00.000Z",
      "hash": "abc123...",
      "order": 0,
      "is_deleted": false,
      "userId": "user-uuid"
    }
  ],
  "tasks": [
    {
      "id": "task-uuid-1",
      "name": "Complete documentation",
      "description": "Write API docs",
      "status": "not_completed",
      "createdAt": "2025-01-14T09:00:00.000Z",
      "lastModified": "2025-01-15T11:00:00.000Z",
      "dueDate": "2025-01-20T00:00:00.000Z",
      "hash": "def456...",
      "order": 0,
      "metadata": null,
      "is_deleted": false,
      "listId": "list-uuid-1",
      "parentId": null
    }
  ]
}
```

**Use Case**: Initial app load or after clearing local data.

---

### Sync Changes

Synchronize local changes with the server and receive updates.

**Endpoint**: `POST /sync`

**Authentication**: Required

**Request Body**:

```json
{
  "changes": {
    "taskLists": [
      {
        "id": "list-uuid-1",
        "name": "Updated List Name",
        "description": "Updated description",
        "lastModified": "2025-01-15T12:30:00.000Z",
        "hash": "new-hash-123",
        "order": 0,
        "is_deleted": false
      }
    ],
    "tasks": [
      {
        "id": "task-uuid-1",
        "name": "Updated Task",
        "description": "Updated description",
        "status": "completed",
        "createdAt": "2025-01-14T09:00:00.000Z",
        "lastModified": "2025-01-15T12:30:00.000Z",
        "dueDate": "2025-01-20T00:00:00.000Z",
        "listId": "list-uuid-1",
        "parentId": null,
        "order": 0,
        "is_deleted": false,
        "hash": "new-hash-456",
        "metadata": {
          "customField": "value"
        }
      }
    ]
  },
  "lastSync": "2025-01-15T11:00:00.000Z",
  "socketId": "socket-connection-id" // Optional
}
```

**Request Fields**:

- `changes.taskLists`: Array of task lists to sync (push to server)
- `changes.tasks`: Array of tasks to sync (push to server)
- `lastSync`: ISO timestamp of last successful sync (for pulling changes)
- `socketId`: Optional Socket.IO connection ID to avoid self-notification

**Conflict Resolution**:

Changes are accepted based on:

1. `lastModified` timestamp (newer wins)
2. If timestamps are equal, `hash` value (higher lexicographically wins)

**Success Response** (200):

```json
{
  "timestamp": "2025-01-15T12:35:00.000Z",
  "changes": {
    "taskLists": [
      {
        "id": "list-uuid-2",
        "name": "Shared List",
        "description": "From another device",
        "lastModified": "2025-01-15T12:00:00.000Z",
        "hash": "server-hash-123",
        "order": 1,
        "is_deleted": false,
        "userId": "user-uuid"
      }
    ],
    "tasks": [
      {
        "id": "task-uuid-5",
        "name": "New task from server",
        "description": null,
        "status": "not_completed",
        "createdAt": "2025-01-15T12:00:00.000Z",
        "lastModified": "2025-01-15T12:00:00.000Z",
        "dueDate": null,
        "hash": "server-hash-456",
        "order": 2,
        "metadata": null,
        "is_deleted": false,
        "listId": "list-uuid-2",
        "parentId": null
      }
    ]
  }
}
```

**Response Fields**:

- `timestamp`: Server timestamp of the sync operation
- `changes.taskLists`: Task lists that were updated on the server since `lastSync`
- `changes.tasks`: Tasks that were updated on the server since `lastSync`

**Error Responses**:

```json
// 400 Bad Request - Invalid sync data
{
  "message": "Invalid sync data",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["changes", "tasks", 0, "id"],
      "message": "Required"
    }
  ]
}

// 500 Internal Server Error
{
  "message": "Internal server error during sync"
}
```

**Sync Flow**:

1. Client sends local changes since last sync
2. Server validates and applies changes using conflict resolution
3. Server returns changes from other clients since `lastSync`
4. Client applies server changes to local database
5. Client stores new `timestamp` for next sync

---

## Real-time Updates

### Socket.IO Connection

The server uses Socket.IO for real-time notifications when data changes.

**Endpoint**: `ws://localhost:3000` (or wss:// for production)

**Authentication**: Include JWT token in connection:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_JWT_TOKEN',
  },
});
```

### Events

#### Client → Server

**`join-user-room`**: Join your user-specific room for notifications

```javascript
socket.emit('join-user-room');
```

#### Server → Client

**`user-update`**: Notifies when data has changed on the server

```javascript
socket.on('user-update', data => {
  console.log('Data updated:', data);
  // Trigger a sync operation
});
```

**Payload**:

```json
{
  "message": "Data updated",
  "userId": "user-uuid"
}
```

**Use Case**: When another client syncs changes, all other connected clients receive this notification and should trigger a sync to get the latest data.

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "status": 400,
  "message": "Error description"
}
```

### HTTP Status Codes

| Code | Meaning               | Usage                                    |
| ---- | --------------------- | ---------------------------------------- |
| 200  | OK                    | Successful request                       |
| 201  | Created               | Resource created successfully            |
| 400  | Bad Request           | Invalid request data or validation error |
| 401  | Unauthorized          | Missing or invalid authentication token  |
| 403  | Forbidden             | Authenticated but not authorized         |
| 404  | Not Found             | Resource not found                       |
| 409  | Conflict              | Resource already exists                  |
| 500  | Internal Server Error | Server-side error                        |

### Validation Errors

Validation errors (from Zod) include detailed issue information:

```json
{
  "issues": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": ["email"],
      "message": "Expected string, received number"
    }
  ]
}
```

---

## Health Check

### Server Health

Check if the server is running.

**Endpoint**: `GET /health`

**Authentication**: Not required

**Success Response** (200):

```json
{
  "ok": true,
  "message": "Server is healthy"
}
```

---

## Data Models

### User

```typescript
interface User {
  id: string; // UUID
  email: string; // Unique email
  passwordHash: string; // bcrypt hash (not returned in API)
  name: string | null; // Optional display name
  createdAt: Date; // Account creation timestamp
  updatedAt: Date; // Last update timestamp
}
```

### TaskList

```typescript
interface TaskList {
  id: string; // UUID
  name: string; // List name
  description: string | null; // Optional description
  lastModified: Date; // Last modification timestamp
  hash: string; // Content hash for conflict resolution
  order: number; // Display order (float)
  is_deleted: boolean; // Soft delete flag
  userId: string; // Owner user ID
}
```

### Task

```typescript
enum TaskStatus {
  NOT_COMPLETED = 'not_completed',
  COMPLETED = 'completed',
}

interface Task {
  id: string; // UUID
  name: string; // Task name
  description: string | null; // Optional description
  status: TaskStatus; // Completion status
  createdAt: Date; // Creation timestamp
  lastModified: Date; // Last modification timestamp
  dueDate: Date | null; // Optional due date
  hash: string; // Content hash for conflict resolution
  order: number; // Display order (float)
  metadata: Record<string, any> | null; // Optional custom data
  is_deleted: boolean; // Soft delete flag
  listId: string; // Parent list ID
  parentId: string | null; // Parent task ID for subtasks
}
```

---

## Example Usage

### JavaScript/TypeScript Client

```typescript
import axios from 'axios';
import io from 'socket.io-client';

const API_BASE = 'http://localhost:3000/api/v1';

// Register
async function register(email: string, password: string, name?: string) {
  const response = await axios.post(`${API_BASE}/auth/register`, {
    email,
    password,
    name,
  });
  return response.data;
}

// Login
async function login(email: string, password: string) {
  const response = await axios.post(`${API_BASE}/auth/login`, {
    email,
    password,
  });
  const { token, user } = response.data;
  // Store token securely
  localStorage.setItem('jwt_token', token);
  return { token, user };
}

// Sync
async function sync(changes: any, lastSync: string) {
  const token = localStorage.getItem('jwt_token');
  const response = await axios.post(
    `${API_BASE}/sync`,
    {
      changes,
      lastSync,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

// Real-time connection
function connectSocket(token: string) {
  const socket = io('http://localhost:3000', {
    auth: { token },
  });

  socket.on('connect', () => {
    console.log('Connected to sync server');
    socket.emit('join-user-room');
  });

  socket.on('user-update', () => {
    console.log('Data updated, triggering sync...');
    // Trigger sync operation
  });

  return socket;
}
```

---

## Environment Variables

Required environment variables for the server:

```env
# Server Configuration
SERVER_PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/t8d

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# CORS (comma-separated allowed origins)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

---

**API Version**: 1.0
**Last Updated**: 2025-11-15

For more information, see [CONTRIBUTING.md](../CONTRIBUTING.md) and [WORKFLOW.md](../WORKFLOW.md).
