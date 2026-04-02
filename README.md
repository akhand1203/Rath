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

---

# Maps API Documentation

The Maps API provides location-based services using OpenStreetMap Nominatim API with intelligent caching to avoid rate limits.

## GET /maps/get-suggestions

#### Description
Fetches location suggestions based on partial text input. Returns up to 10 matching locations with coordinates. Results are cached for 5 minutes to optimize API calls and prevent rate limiting.

---

## Request Details

### HTTP Method
```
GET
```

### Endpoint URL
```
/maps/get-suggestions
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `input` | string | Yes | Partial location name to search for (minimum 2 characters) |

### Example Request

```
GET /maps/get-suggestions?input=delhi
```

### Request Body
None - Parameters passed in query string

---

## Response Details

### Success Response (HTTP 200 - OK)

Returns an array of location suggestions with full details.

```json
[
  {
    "id": 1,
    "displayName": "Delhi, India",
    "lat": 28.6139,
    "lng": 77.209,
    "type": "city",
    "importance": 0.8
  },
  {
    "id": 2,
    "displayName": "New Delhi, India",
    "lat": 28.6355,
    "lng": 77.225,
    "type": "city",
    "importance": 0.8
  }
]
```

**Status Code:** `200 OK`

---

### Validation Error Response (HTTP 400 - Bad Request)

Returned when search input is missing or invalid.

```json
{
  "message": "Search input is required"
}
```

**Status Code:** `400 Bad Request`

---

### Server Error Response (HTTP 500 - Internal Server Error)

```json
{
  "message": "Internal server error"
}
```

**Status Code:** `500 Internal Server Error`

---

## Example cURL Request

```bash
curl -X GET "http://localhost:4000/maps/get-suggestions?input=delhi"
```

---

## GET /maps/get-coordinates

#### Description
Converts a human-readable address into geographic coordinates (latitude and longitude) using OpenStreetMap Nominatim API.

---

## Request Details

### HTTP Method
```
GET
```

### Endpoint URL
```
/maps/get-coordinates
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | Yes | Complete or partial address to geocode |

### Example Request

```
GET /maps/get-coordinates?address=Delhi,%20India
```

---

## Response Details

### Success Response (HTTP 200 - OK)

Returns the geographic coordinates for the given address.

```json
{
  "lat": 28.6139,
  "lng": 77.2090
}
```

**Status Code:** `200 OK`

---

### Validation Error Response (HTTP 400 - Bad Request)

```json
{
  "message": "Address is required"
}
```

**Status Code:** `400 Bad Request`

---

### Not Found Response (HTTP 500)

```json
{
  "message": "Internal server error"
}
```

**Status Code:** `500 Internal Server Error`

---

## Example cURL Request

```bash
curl -X GET "http://localhost:4000/maps/get-coordinates?address=Delhi,India"
```

---

## GET /maps/get-address

#### Description
Reverse geocodes geographic coordinates into a human-readable address using OpenStreetMap Nominatim API.

---

## Request Details

### HTTP Method
```
GET
```

### Endpoint URL
```
/maps/get-address
```

### Query Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| `lat` | number | Yes | Between -90 and 90 | Latitude coordinate |
| `lng` | number | Yes | Between -180 and 180 | Longitude coordinate |

### Example Request

```
GET /maps/get-address?lat=28.6139&lng=77.2090
```

---

## Response Details

### Success Response (HTTP 200 - OK)

Returns the address details for the given coordinates.

```json
{
  "address": {
    "road": "Main Street",
    "suburb": "New Delhi",
    "city": "Delhi",
    "state": "Delhi",
    "postcode": "110001",
    "country": "India"
  },
  "displayName": "Main Street, New Delhi, Delhi, 110001, India",
  "lat": 28.6139,
  "lng": 77.2090
}
```

**Status Code:** `200 OK`

---

### Validation Error Response (HTTP 400 - Bad Request)

```json
{
  "message": "Latitude and longitude are required"
}
```

**Status Code:** `400 Bad Request`

---

### Server Error Response (HTTP 500)

```json
{
  "message": "Internal server error"
}
```

**Status Code:** `500 Internal Server Error`

---

## Example cURL Request

```bash
curl -X GET "http://localhost:4000/maps/get-address?lat=28.6139&lng=77.2090"
```

---

## GET /maps/get-distance

#### Description
Calculates the distance and estimated duration between two geographic coordinates using OSRM (Open Source Routing Machine) API. Returns distance in kilometers and duration in minutes.

---

## Request Details

### HTTP Method
```
GET
```

### Endpoint URL
```
/maps/get-distance
```

### Query Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| `lat1` | number | Yes | Between -90 and 90 | Starting point latitude |
| `lng1` | number | Yes | Between -180 and 180 | Starting point longitude |
| `lat2` | number | Yes | Between -90 and 90 | Destination latitude |
| `lng2` | number | Yes | Between -180 and 180 | Destination longitude |

### Example Request

```
GET /maps/get-distance?lat1=28.6139&lng1=77.2090&lat2=28.5355&lng2=77.3910
```

---

## Response Details

### Success Response (HTTP 200 - OK)

Returns distance and duration information between two points.

```json
{
  "distance": 15.5,
  "duration": 45,
  "lat1": 28.6139,
  "lng1": 77.2090,
  "lat2": 28.5355,
  "lng2": 77.3910
}
```

**Status Code:** `200 OK`

---

### Validation Error Response (HTTP 400 - Bad Request)

```json
{
  "message": "All coordinates are required"
}
```

**Status Code:** `400 Bad Request`

---

### Server Error Response (HTTP 500)

```json
{
  "message": "Internal server error"
}
```

**Status Code:** `500 Internal Server Error`

---

## Example cURL Request

```bash
curl -X GET "http://localhost:4000/maps/get-distance?lat1=28.6139&lng1=77.2090&lat2=28.5355&lng2=77.3910"
```

---

# Rides API Documentation

The Rides API manages ride creation, retrieval, status updates, and fare calculations for the ride-sharing application.

## POST /rides/create

#### Description
Creates a new ride request with pickup and destination locations. Requires authentication. The ride starts in 'pending' status waiting for a captain to accept it.

---

## Request Details

### HTTP Method
```
POST
```

### Endpoint URL
```
/rides/create
```

### Authorization
**Required** - JWT token in header or cookie

### Content-Type
```
application/json
```

### Request Body

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `pickup` | string | Yes | Non-empty string | Pickup location address |
| `destination` | string | Yes | Non-empty string | Destination location address |
| `vehicleType` | string | Yes | One of: `bike`, `auto`, `car` | Type of vehicle requested |

### Example Request

```json
{
  "pickup": "Delhi Airport, New Delhi",
  "destination": "India Gate, New Delhi",
  "vehicleType": "car"
}
```

---

## Response Details

### Success Response (HTTP 201 - Created)

Returns the created ride object with unique ID and initial status.

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user": "507f1f77bcf86cd799439010",
  "pickup": "Delhi Airport, New Delhi",
  "destination": "India Gate, New Delhi",
  "vehicleType": "car",
  "status": "pending",
  "fare": 450,
  "createdAt": "2024-03-26T10:30:00Z",
  "updatedAt": "2024-03-26T10:30:00Z"
}
```

**Status Code:** `201 Created`

---

### Validation Error Response (HTTP 400 - Bad Request)

```json
{
  "errors": [
    {
      "msg": "Invalid pickup location"
    }
  ]
}
```

**Status Code:** `400 Bad Request`

---

### Unauthorized Response (HTTP 401)

```json
{
  "message": "Unauthorized"
}
```

---

## Example cURL Request

```bash
curl -X POST http://localhost:4000/rides/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "pickup": "Delhi Airport",
    "destination": "India Gate",
    "vehicleType": "car"
  }'
```

---

## GET /rides/my-rides

#### Description
Retrieves all rides created by the authenticated user. Returns rides in reverse chronological order (newest first).

---

## Request Details

### HTTP Method
```
GET
```

### Endpoint URL
```
/rides/my-rides
```

### Authorization
**Required** - JWT token in header or cookie

---

## Response Details

### Success Response (HTTP 200 - OK)

Returns an array of all rides created by the user.

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "user": "507f1f77bcf86cd799439010",
    "pickup": "Delhi Airport, New Delhi",
    "destination": "India Gate, New Delhi",
    "vehicleType": "car",
    "status": "completed",
    "fare": 450,
    "createdAt": "2024-03-26T10:30:00Z",
    "updatedAt": "2024-03-26T11:15:00Z"
  }
]
```

**Status Code:** `200 OK`

---

### Unauthorized Response (HTTP 401)

```json
{
  "message": "Unauthorized"
}
```

---

## Example cURL Request

```bash
curl -X GET http://localhost:4000/rides/my-rides \
  -H "Authorization: Bearer <jwt_token>"
```

---

## GET /rides/:rideId

#### Description
Retrieves detailed information about a specific ride by its ID. Requires authentication.

---

## Request Details

### HTTP Method
```
GET
```

### Endpoint URL
```
/rides/{rideId}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rideId` | string | Yes | MongoDB ObjectId of the ride |

### Authorization
**Required** - JWT token

### Example Request

```
GET /rides/507f1f77bcf86cd799439011
```

---

## Response Details

### Success Response (HTTP 200 - OK)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user": "507f1f77bcf86cd799439010",
  "captain": "507f1f77bcf86cd799439012",
  "pickup": "Delhi Airport, New Delhi",
  "destination": "India Gate, New Delhi",
  "vehicleType": "car",
  "status": "in-progress",
  "fare": 450,
  "createdAt": "2024-03-26T10:30:00Z",
  "updatedAt": "2024-03-26T10:45:00Z"
}
```

**Status Code:** `200 OK`

---

### Not Found Response (HTTP 404)

```json
{
  "message": "Ride not found"
}
```

---

## Example cURL Request

```bash
curl -X GET http://localhost:4000/rides/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <jwt_token>"
```

---

## GET /rides

#### Description
Retrieves all rides with pagination support. Requires authentication.

---

## Request Details

### HTTP Method
```
GET
```

### Endpoint URL
```
/rides
```

### Query Parameters (Optional)

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number for pagination (default: 1) |
| `limit` | number | Rides per page (default: 10) |

### Authorization
**Required** - JWT token

---

## Response Details

### Success Response (HTTP 200 - OK)

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "user": "507f1f77bcf86cd799439010",
    "pickup": "Delhi Airport, New Delhi",
    "destination": "India Gate, New Delhi",
    "vehicleType": "car",
    "status": "completed",
    "fare": 450,
    "createdAt": "2024-03-26T10:30:00Z",
    "updatedAt": "2024-03-26T11:15:00Z"
  }
]
```

**Status Code:** `200 OK`

---

## Example cURL Request

```bash
curl -X GET "http://localhost:4000/rides?page=1&limit=10" \
  -H "Authorization: Bearer <jwt_token>"
```

---

## PUT /rides/:rideId/status

#### Description
Updates the status of a specific ride. Requires authentication. Valid status transitions: pending → accepted → started → completed/cancelled.

---

## Request Details

### HTTP Method
```
PUT
```

### Endpoint URL
```
/rides/{rideId}/status
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rideId` | string | Yes | MongoDB ObjectId of the ride |

### Content-Type
```
application/json
```

### Request Body

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `status` | string | Yes | One of: `pending`, `accepted`, `started`, `completed`, `cancelled` | New ride status |

### Authorization
**Required** - JWT token

### Example Request

```json
{
  "status": "accepted"
}
```

---

## Response Details

### Success Response (HTTP 200 - OK)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user": "507f1f77bcf86cd799439010",
  "pickup": "Delhi Airport, New Delhi",
  "destination": "India Gate, New Delhi",
  "vehicleType": "car",
  "status": "accepted",
  "fare": 450,
  "createdAt": "2024-03-26T10:30:00Z",
  "updatedAt": "2024-03-26T10:35:00Z"
}
```

**Status Code:** `200 OK`

---

### Validation Error Response (HTTP 400 - Bad Request)

```json
{
  "errors": [
    {
      "msg": "Invalid status"
    }
  ]
}
```

---

## Example cURL Request

```bash
curl -X PUT http://localhost:4000/rides/507f1f77bcf86cd799439011/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "status": "completed"
  }'
```

---

## GET /rides/fare/:rideId

#### Description
Calculates the fare for a ride based on distance between pickup and destination coordinates.

---

## Request Details

### HTTP Method
```
GET
```

### Endpoint URL
```
/rides/fare/{rideId}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rideId` | string | Yes | MongoDB ObjectId of the ride |

### Query Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| `pickupLat` | number | Yes | -90 to 90 | Pickup location latitude |
| `pickupLng` | number | Yes | -180 to 180 | Pickup location longitude |
| `destLat` | number | Yes | -90 to 90 | Destination latitude |
| `destLng` | number | Yes | -180 to 180 | Destination longitude |

### Authorization
**Required** - JWT token

### Example Request

```
GET /rides/fare/507f1f77bcf86cd799439011?pickupLat=28.6139&pickupLng=77.2090&destLat=28.5355&destLng=77.3910
```

---

## Response Details

### Success Response (HTTP 200 - OK)

```json
{
  "rideId": "507f1f77bcf86cd799439011",
  "distance": 15.5,
  "duration": 45,
  "fare": 450,
  "baseFare": 50,
  "perKmRate": 20,
  "perMinRate": 5
}
```

**Status Code:** `200 OK`

---

### Validation Error Response (HTTP 400 - Bad Request)

```json
{
  "errors": [
    {
      "msg": "Invalid pickup latitude"
    }
  ]
}
```

---

## Example cURL Request

```bash
curl -X GET "http://localhost:4000/rides/fare/507f1f77bcf86cd799439011?pickupLat=28.6139&pickupLng=77.2090&destLat=28.5355&destLng=77.3910" \
  -H "Authorization: Bearer <jwt_token>"
```

---

## Ride Status Values

| Status | Description | Transition |
|--------|-------------|-----------|
| `pending` | Ride created, waiting for captain to accept | → accepted |
| `accepted` | Captain has accepted the ride | → started |
| `started` | Ride in progress | → completed, cancelled |
| `completed` | Ride finished successfully | Final state |
| `cancelled` | Ride cancelled | Final state |

---

## Fare Calculation

The fare is calculated using the following formula:

```
fare = baseFare + (distance * perKmRate) + (duration * perMinRate)
```

Where:
- **baseFare**: Base amount (typically ₹50)
- **distance**: Distance in kilometers from OSRM API
- **perKmRate**: Rate per kilometer (typically ₹20)
- **duration**: Time in minutes from OSRM API
- **perMinRate**: Rate per minute (typically ₹5)
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

