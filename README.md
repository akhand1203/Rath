# Rath - User Authentication API

A Node.js/Express backend service for user registration and authentication.

---

## Backend API Documentation

### POST /users/register

#### Description
This endpoint registers a new user by creating a user account with the provided credentials. The password is hashed using bcrypt before storing in the database, and a JWT authentication token is generated and returned upon successful registration.

---

## Request Details

### HTTP Method
```
POST
```

### Endpoint URL
```
/users/register
```

### Content-Type
```
application/json
```

### Request Body

The request body must be a JSON object with the following fields:

#### Required Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `email` | string | Must be a valid email | User's email address |
| `fullname.firstname` | string | Minimum 3 characters | User's first name |
| `password` | string | Minimum 6 characters | User's password |

#### Optional Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `fullname.lastname` | string | Minimum 3 characters (if provided) | User's last name |

### Example Request

```json
{
  "fullname": {
    "firstname": "Akhand",
    "lastname": "Singh"
  },
  "email": "akhand@example.com",
  "password": "password123"
}
```

---

## Response Details

### Success Response (HTTP 201 - Created)

Returns the created user object and an authentication JWT token.

```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullname": {
      "firstname": "Akhand",
      "lastname": "Singh"
    },
    "email": "akhand@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Code:** `201 Created`

---

### Validation Error Response (HTTP 400 - Bad Request)

Returned when the request data fails validation (invalid email format, insufficient character length, missing required fields).

```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Invalid Email",
      "path": "email",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "First name must be at least 3 characters long",
      "path": "fullname.firstname",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "Password must be at least 6 characters long",
      "path": "password",
      "location": "body"
    }
  ]
}
```

**Status Code:** `400 Bad Request`

---

### Server Error Response (HTTP 500 - Internal Server Error)

Returned when an unexpected server error occurs (database connection failure, hashing error, etc.).

```json
{
  "error": "Internal Server Error"
}
```

**Status Code:** `500 Internal Server Error`

---

## Status Codes Summary

| Status Code | Description | When It Occurs |
|-------------|-------------|---|
| **201** | Created | User successfully registered |
| **400** | Bad Request | Validation failed (invalid email, short name/password, missing fields) |
| **500** | Internal Server Error | Database error, server-side exceptions |

---

## Validation Rules

### Email Validation
- Must be a valid email format (e.g., `user@example.com`)
- Validation is performed using `isEmail()` from express-validator

### First Name Validation
- Minimum length: **3 characters**
- Required field

### Last Name Validation
- Minimum length: **3 characters** (if provided)
- Optional field

### Password Validation
- Minimum length: **6 characters**
- Required field
- Will be hashed using bcrypt before storage

---

## Example cURL Request

```bash
curl -X POST http://localhost:4000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "password": "securepass123"
  }'
```

---

## Notes

- The token returned in the response is a JWT token with a 1-hour expiration time
- The password field is hashed using bcrypt with a salt round of 10
- Duplicate emails are not allowed (unique constraint on email field)
- The password field is not returned in the response for security reasons
