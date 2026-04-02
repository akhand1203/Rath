const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    captainId: { type: mongoose.Schema.Types.ObjectId, ref: "Captain" },
    pickup: {
      type: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String, required: true }
      },
      required: true
    },
    destination: {
      type: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String, required: true }
      },
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "started", "completed", "cancelled"],
      default: "pending",
    },
    vehicleType: {
      type: String,
      enum: ["motorcycle", "auto", "car"],
      required: true
    },
    fare: { type: Number },
    distance: { type: Number },
    duration: { type: Number },
    paymentId: { type: String },  
    orderId: { type: String },
    signature: { type: String },
    otp: { 
      type: String,
      required: true,
      minlength: 6,
      maxlength: 6
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from creation
      index: true
    },
  },
  { timestamps: true },
);

const Ride = mongoose.model("Ride", rideSchema);

module.exports = Ride;
