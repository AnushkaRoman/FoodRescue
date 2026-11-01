const express = require("express");
const router = express.Router();

const {
  body,
  validationResult
} = require("express-validator");

const {
  createDonation,
  getAllDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  updateDonationStatus
} = require("../controllers/donationController");

// Validation middleware
const validateDonation = [
  body("donorName")
    .trim()
    .notEmpty().withMessage("Donor name is required")
    .isLength({ min: 2 }).withMessage("Donor name must contain at least 2 characters"),

  body("foodName")
    .trim()
    .notEmpty().withMessage("Food name is required"),

  body("category")
    .isIn(["Cooked Food", "Fruits", "Vegetables", "Bakery", "Packaged Food", "Other"])
    .withMessage("Invalid food category"),

  body("quantity")
    .isFloat({ min: 1 }).withMessage("Quantity must be at least 1"),

  body("unit")
    .isIn(["Meals", "Kg", "Packets", "Boxes"])
    .withMessage("Invalid quantity unit"),

  body("location")
    .trim()
    .notEmpty().withMessage("Location is required"),

  body("contact")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit Indian mobile number"),

  body("expiryTime")
    .isISO8601().withMessage("Enter a valid expiry date and time")
    .custom(value => new Date(value) > new Date())
    .withMessage("Expiry time must be in the future")
];

// Partial update validation
const validateUpdate = [
  body("donorName").optional().trim().isLength({ min: 2 }),
  body("foodName").optional().trim().notEmpty(),
  body("category").optional().isIn(["Cooked Food", "Fruits", "Vegetables", "Bakery", "Packaged Food", "Other"]),
  body("quantity").optional().isFloat({ min: 1 }),
  body("unit").optional().isIn(["Meals", "Kg", "Packets", "Boxes"]),
  body("location").optional().trim().notEmpty(),
  body("contact").optional().matches(/^[6-9]\d{9}$/),
  body("expiryTime").optional().isISO8601()
];

// Check validation errors
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }

  next();
};

// CRUD routes
router.post("/", validateDonation, checkValidation, createDonation);

router.get("/", getAllDonations);

router.get("/:id", getDonationById);

router.put("/:id", validateUpdate, checkValidation, updateDonation);

router.patch("/:id/status", updateDonationStatus);

router.delete("/:id", deleteDonation);

module.exports = router;