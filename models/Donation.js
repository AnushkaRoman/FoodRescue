const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donorName: {
      type: String,
      required: [true, "Donor name is required"],
      trim: true,
      minlength: [2, "Donor name must contain at least 2 characters"]
    },

    foodName: {
      type: String,
      required: [true, "Food name is required"],
      trim: true
    },

    category: {
      type: String,
      required: [true, "Food category is required"],
      enum: ["Cooked Food", "Fruits", "Vegetables", "Bakery", "Packaged Food", "Other"]
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"]
    },

    unit: {
      type: String,
      required: true,
      enum: ["Meals", "Kg", "Packets", "Boxes"]
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true
    },

    contact: {
      type: String,
      required: [true, "Contact number is required"],
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"]
    },

    expiryTime: {
      type: Date,
      required: [true, "Expiry time is required"]
    },

    status: {
      type: String,
      enum: ["Available", "Claimed", "Collected", "Expired"],
      default: "Available"
    },

    claimedBy: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Donation", donationSchema);