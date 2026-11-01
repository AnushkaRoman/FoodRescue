const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));

    return res.status(400).json({
      success: false,
      message: "Database validation failed",
      errors
    });
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format"
    });
  }

  // Duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value already exists"
    });
  }

  // General server error
  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
};

module.exports = errorMiddleware;