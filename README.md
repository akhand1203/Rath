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

## POST /users/login

#### Description
This endpoint authenticates a user by verifying email and password credentials. If valid, returns the user object and a JWT authentication token for subsequent API requests.

---

## Request Details

### HTTP Method
```
POST
```

### Endpoint URL
```
/users/login
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
| `password` | string | Minimum 6 characters | User's password |

### Example Request

```json
{
  "email": "akhand@example.com",
  "password": "password123"
}
```

---

## Response Details

### Success Response (HTTP 200 - OK)

Returns the authenticated user object and an authentication JWT token.

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

**Status Code:** `200 OK`

---

### Validation Error Response (HTTP 400 - Bad Request)

Returned when the request data fails validation (invalid email format, short password).

```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Invalid Email",
      "path": "email",
      "location": "body"
    }
  ]
}
```

**Status Code:** `400 Bad Request`

---

### Invalid Credentials Response (HTTP 401 - Unauthorized)

Returned when email is not found or password is incorrect.

```json
{
  "message": "Invalid email or password"
}
```

**Status Code:** `401 Unauthorized`

---

### Server Error Response (HTTP 500 - Internal Server Error)

Returned when an unexpected server error occurs.

```json
{
  "error": "Internal Server Error"
}
```

**Status Code:** `500 Internal Server Error`

---

## Status Codes Summary (Login)

| Status Code | Description | When It Occurs |
|-------------|-------------|---|
| **200** | OK | User authenticated successfully |
| **400** | Bad Request | Validation failed (invalid email, short password) |
| **401** | Unauthorized | Email not found or password incorrect |
| **500** | Internal Server Error | Database error, server-side exceptions |

---

## Example cURL Request for Login

```bash
curl -X POST http://localhost:4000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepass123"
  }'
```

---

## GET /users/profile

#### Description
This endpoint retrieves the authenticated user's profile information. Requires valid JWT token in the Authorization header or as a cookie. The auth middleware validates the token before returning the user data.

---

## Request Details

### HTTP Method
```
GET
```

### Endpoint URL
```
/users/profile
```

### Authentication
**Required** - Must include valid JWT token

#### Option 1: Bearer Token in Header
```
Authorization: Bearer <jwt_token>
```

#### Option 2: Token in Cookie
```
Cookie: token=<jwt_token>
```

### Request Body
None - No request body required

---

## Response Details

### Success Response (HTTP 200 - OK)

Returns the authenticated user's profile data.

```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullname": {
      "firstname": "Akhand",
      "lastname": "Singh"
    },
    "email": "akhand@example.com"
  }
}
```

**Status Code:** `200 OK`

---

### Unauthorized Response (HTTP 401 - Unauthorized)

Returned when token is missing, invalid, or expired.

```json
{
  "message": "Unauthorized"
}
```

**Status Code:** `401 Unauthorized`

---

### Server Error Response (HTTP 500 - Internal Server Error)

Returned when an unexpected server error occurs.

```json
{
  "error": "Internal Server Error"
}
```

**Status Code:** `500 Internal Server Error`

---

## Status Codes Summary (Profile)

| Status Code | Description | When It Occurs |
|-------------|-------------|---|
| **200** | OK | User profile retrieved successfully |
| **401** | Unauthorized | Missing, invalid, or expired token |
| **500** | Internal Server Error | Server-side exceptions |

---

## Example cURL Request for Profile

```bash
curl -X GET http://localhost:4000/users/profile \
  -H "Authorization: Bearer <jwt_token>"
```

---

## GET /users/logout

#### Description
This endpoint logs out the authenticated user by clearing the authentication token cookie and adding the token to a blacklist to prevent reuse. Requires valid JWT token.

---

## Request Details

### HTTP Method
```
GET
```

### Endpoint URL
```
/users/logout
```

### Authentication
**Required** - Must include valid JWT token

#### Option 1: Bearer Token in Header
```
Authorization: Bearer <jwt_token>
```

#### Option 2: Token in Cookie
```
Cookie: token=<jwt_token>
```

### Request Body
None - No request body required

---

## Response Details

### Success Response (HTTP 200 - OK)

Returns a success message after logout. The token is blacklisted and cookie is cleared.

```json
{
  "message": "Logged out"
}
```

**Status Code:** `200 OK`

---

### Unauthorized Response (HTTP 401 - Unauthorized)

Returned when token is missing, invalid, or expired.

```json
{
  "message": "Unauthorized"
}
```

**Status Code:** `401 Unauthorized`

---

### Server Error Response (HTTP 500 - Internal Server Error)

Returned when an unexpected server error occurs.

```json
{
  "error": "Internal Server Error"
}
```

**Status Code:** `500 Internal Server Error`

---

## Status Codes Summary (Logout)

| Status Code | Description | When It Occurs |
|-------------|-------------|---|
| **200** | OK | User logged out successfully |
| **401** | Unauthorized | Missing, invalid, or expired token |
| **500** | Internal Server Error | Server-side exceptions |

---

## Example cURL Request for Logout

```bash
curl -X GET http://localhost:4000/users/logout \
  -H "Authorization: Bearer <jwt_token>"
```

---

# Captain API Documentation

## POST /captains/register

#### Description
This endpoint registers a new captain (driver) by creating a captain account with the provided credentials and vehicle information. The password is hashed using bcrypt before storing in the database, and a JWT authentication token is generated and returned upon successful registration.

---

## Request Details

### HTTP Method
```
POST
```

### Endpoint URL
```
/captains/register
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
| `email` | string | Must be a valid email | Captain's email address |
| `fullname.firstname` | string | Minimum 3 characters | Captain's first name |
| `password` | string | Minimum 6 characters | Captain's password |
| `vehicle.color` | string | Minimum 3 characters | Vehicle color |
| `vehicle.plate` | string | Minimum 3 characters | Vehicle license plate |
| `vehicle.capacity` | number | Minimum 1 | Number of passengers the vehicle can hold |
| `vehicle.vehicleType` | string | One of: `car`, `motorcycle`, `auto` | Type of vehicle |

#### Optional Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `fullname.lastname` | string | Minimum 3 characters (if provided) | Captain's last name |

### Example Request

```json
{
  "fullname": {
    "firstname": "Rajesh",
    "lastname": "Kumar"
  },
  "email": "rajesh.kumar@example.com",
  "password": "captain123",
  "vehicle": {
    "color": "Black",
    "plate": "ABC1234",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```

---

## Response Details

### Success Response (HTTP 201 - Created)

Returns the created captain object and an authentication JWT token.

```json
{
  "captain": {
    "_id": "507f1f77bcf86cd799439012",
    "fullname": {
      "firstname": "Rajesh",
      "lastname": "Kumar"
    },
    "email": "rajesh.kumar@example.com",
    "status": "inactive",
    "vehicle": {
      "color": "Black",
      "plate": "ABC1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Code:** `201 Created`

---

### Validation Error Response (HTTP 400 - Bad Request)

Returned when the request data fails validation (invalid email, short fields, invalid vehicle type, etc.).

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
      "msg": "Capacity must be at least 1",
      "path": "vehicle.capacity",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "Vehicle type must be car, motorcycle, or auto",
      "path": "vehicle.vehicleType",
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

## Status Codes Summary (Captain Register)

| Status Code | Description | When It Occurs |
|-------------|-------------|---|
| **201** | Created | Captain successfully registered |
| **400** | Bad Request | Validation failed (invalid email, short fields, invalid vehicle type) |
| **500** | Internal Server Error | Database error, server-side exceptions |

---

## Validation Rules (Captain Register)

### Email Validation
- Must be a valid email format (e.g., `captain@example.com`)
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

### Vehicle Color Validation
- Minimum length: **3 characters**
- Required field

### Vehicle Plate Validation
- Minimum length: **3 characters**
- Required field
- Should be a valid vehicle license plate

### Vehicle Capacity Validation
- Minimum value: **1**
- Must be an integer
- Required field

### Vehicle Type Validation
- Must be one of: `car`, `motorcycle`, `auto`
- Case-sensitive
- Required field

---

## Example cURL Request for Captain Register

```bash
curl -X POST http://localhost:4000/captains/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": {
      "firstname": "Rajesh",
      "lastname": "Kumar"
    },
    "email": "rajesh.kumar@example.com",
    "password": "captain123",
    "vehicle": {
      "color": "Black",
      "plate": "ABC1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  }'
```

---

## POST /captains/login

#### Description
This endpoint authenticates a captain by verifying email and password credentials. If valid, returns the captain object and a JWT authentication token for subsequent API requests.

---

## Request Details

### HTTP Method
```
POST
```

### Endpoint URL
```
/captains/login
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
| `email` | string | Must be a valid email | Captain's email address |
| `password` | string | Minimum 6 characters | Captain's password |

### Example Request

```json
{
  "email": "rajesh.kumar@example.com",
  "password": "captain123"
}
```

---

## Response Details

### Success Response (HTTP 200 - OK)

Returns the authenticated captain object and an authentication JWT token.

```json
{
  "captain": {
    "_id": "507f1f77bcf86cd799439012",
    "fullname": {
      "firstname": "Rajesh",
      "lastname": "Kumar"
    },
    "email": "rajesh.kumar@example.com",
    "vehicle": {
      "color": "Black",
      "plate": "ABC1234",
      "capacity": 4,
      "vehicleType": "car"
    },
    "status": "inactive"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Code:** `200 OK`

---

### Validation Error Response (HTTP 400 - Bad Request)

Returned when the request data fails validation (invalid email format, short password).

```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Invalid Email",
      "path": "email",
      "location": "body"
    }
  ]
}
```

**Status Code:** `400 Bad Request`

---

### Invalid Credentials Response (HTTP 401 - Unauthorized)

Returned when email is not found or password is incorrect.

```json
{
  "message": "Invalid email or password"
}
```

**Status Code:** `401 Unauthorized`

---

### Server Error Response (HTTP 500 - Internal Server Error)

Returned when an unexpected server error occurs.

```json
{
  "error": "Internal Server Error"
}
```

**Status Code:** `500 Internal Server Error`

---

## Status Codes Summary (Captain Login)

| Status Code | Description | When It Occurs |
|-------------|-------------|---|
| **200** | OK | Captain authenticated successfully |
| **400** | Bad Request | Validation failed (invalid email, short password) |
| **401** | Unauthorized | Email not found or password incorrect |
| **500** | Internal Server Error | Database error, server-side exceptions |

---

## Example cURL Request for Captain Login

```bash
curl -X POST http://localhost:4000/captains/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rajesh.kumar@example.com",
    "password": "captain123"
  }'
```

---

## GET /captains/profile

#### Description
This endpoint retrieves the authenticated captain's profile information including vehicle details and status. Requires valid JWT token in the Authorization header or as a cookie. The auth middleware validates the token before returning the captain data.

---

## Request Details

### HTTP Method
```
GET
```

### Endpoint URL
```
/captains/profile
```

### Authentication
**Required** - Must include valid JWT token

#### Option 1: Bearer Token in Header
```
Authorization: Bearer <jwt_token>
```

#### Option 2: Token in Cookie
```
Cookie: token=<jwt_token>
```

### Request Body
None - No request body required

---

## Response Details

### Success Response (HTTP 200 - OK)

Returns the authenticated captain's profile data including vehicle information.

```json
{
  "captain": {
    "_id": "507f1f77bcf86cd799439012",
    "fullname": {
      "firstname": "Rajesh",
      "lastname": "Kumar"
    },
    "email": "rajesh.kumar@example.com",
    "vehicle": {
      "color": "Black",
      "plate": "ABC1234",
      "capacity": 4,
      "vehicleType": "car"
    },
    "status": "inactive",
    "location": {
      "lat": null,
      "lng": null
    }
  }
}
```

**Status Code:** `200 OK`

---

### Unauthorized Response (HTTP 401 - Unauthorized)

Returned when token is missing, invalid, or expired.

```json
{
  "message": "Unauthorized"
}
```

**Status Code:** `401 Unauthorized`

---

### Server Error Response (HTTP 500 - Internal Server Error)

Returned when an unexpected server error occurs.

```json
{
  "error": "Internal Server Error"
}
```

**Status Code:** `500 Internal Server Error`

---

## Status Codes Summary (Captain Profile)

| Status Code | Description | When It Occurs |
|-------------|-------------|---|
| **200** | OK | Captain profile retrieved successfully |
| **401** | Unauthorized | Missing, invalid, or expired token |
| **500** | Internal Server Error | Server-side exceptions |

---

## Example cURL Request for Captain Profile

```bash
curl -X GET http://localhost:4000/captains/profile \
  -H "Authorization: Bearer <jwt_token>"
```

---

## GET /captains/logout

#### Description
This endpoint logs out the authenticated captain by clearing the authentication token cookie and adding the token to a blacklist to prevent reuse. Requires valid JWT token.

---

## Request Details

### HTTP Method
```
GET
```

### Endpoint URL
```
/captains/logout
```

### Authentication
**Required** - Must include valid JWT token

#### Option 1: Bearer Token in Header
```
Authorization: Bearer <jwt_token>
```

#### Option 2: Token in Cookie
```
Cookie: token=<jwt_token>
```

### Request Body
None - No request body required

---

## Response Details

### Success Response (HTTP 200 - OK)

Returns a success message after logout. The token is blacklisted and cookie is cleared.

```json
{
  "message": "Logged out successfully"
}
```

**Status Code:** `200 OK`

---

### Unauthorized Response (HTTP 401 - Unauthorized)

Returned when token is missing, invalid, or expired.

```json
{
  "message": "Unauthorized"
}
```

**Status Code:** `401 Unauthorized`

---

### Server Error Response (HTTP 500 - Internal Server Error)

Returned when an unexpected server error occurs.

```json
{
  "error": "Internal Server Error"
}
```

**Status Code:** `500 Internal Server Error`

---

## Status Codes Summary (Captain Logout)

| Status Code | Description | When It Occurs |
|-------------|-------------|---|
| **200** | OK | Captain logged out successfully |
| **401** | Unauthorized | Missing, invalid, or expired token |
| **500** | Internal Server Error | Server-side exceptions |

---

## Example cURL Request for Captain Logout

```bash
curl -X GET http://localhost:4000/captains/logout \
  -H "Authorization: Bearer <jwt_token>"
```

---

## Notes

- The token returned in the response is a JWT token with a 24-hour expiration time for captains
- The password field is hashed using bcrypt with a salt round of 10
- Duplicate emails are not allowed (unique constraint on email field)
- The password field is not returned in the response for security reasons
- Profile and Logout endpoints require authentication via JWT token
- Logout blacklists the token to prevent reuse after logging out
- Captain status defaults to 'inactive' upon registration and can be updated to 'active'
- User tokens expire in 1 hour, Captain tokens expire in 24 hours
- Captains start with a status of `inactive` by default
- Valid vehicle types are: `car` (4-wheeler), `motorcycle` (2-wheeler), `auto` (3-wheeler/auto-rickshaw)
- Captain registration follows the same structure as user registration but includes vehicle information

