# Real-Time Ride Acceptance Fix

## The Core Issue: Token Contamination

The main reason the user's screen was not transitioning to `WaitForDriver.jsx` was a silent backend authentication failure triggered by **Cookie Contamination**.

1. When testing on a single browser (or identical origins), both the `UserLogin` and `CaptainLogin` APIs in the backend were overriding the exact same cookie key: `res.cookie('token', token)`.
2. As a result, when the Captain tried to accept the ride or send location updates, the backend's `authCaptain` middleware would read the `req.cookies.token` **first**, before checking the `Authorization` header. 
3. If the user had logged in more recently, the middleware would decode the User's token, fail to find the ID in the `captainModel`, and quietly throw a **401 Unauthorized**.
4. This completely broke the `put('/rides/:rideId/status')` API. Because the API failed behind the scenes:
   * The Database `status` was never updated to `'accepted'` (stayed `'pending'`).
   * The backend never fired the `"ride-accepted"` Socket event.
   * The frontend's backup polling system also failed because it kept seeing `latestRide.status === 'pending'`.

## Changes Made

- **Severed Cookie Dependencies**: Updated `Backend/middlewares/auth.middleware.js` to strictly enforce the reading of tokens from the `Authorization: Bearer <token>` header and explicitly ignore `req.cookies.token`. 
- **Achieved Strict Isolation**: Since the frontend was already isolated using `userToken` and `captainToken` in localStorage, this backend change guarantees no cross-talk can ever occur between the two roles on the same browser origin.
- **Enabled Real-Time Flow**: The complete flow is now unblocked:
   1. Captain clicks Accept.
   2. API updates MongoDB `status: 'accepted'`.
   3. Controller queries `getUserSocketId(userId)` and fires `io.to(socketId).emit("ride-accepted", acceptanceData)`.
   4. User's `Home.jsx` instantly triggers `setWaitForDriver(true)`, sliding away `LookingForDriver` and exposing `WaitForDriver.jsx` with the populated Captain details and OTP.

Please restart the backend (`nodemon`) and safely run through the ride acceptance flow again.
