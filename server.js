const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
const donationRoutes = require("./routes/donationRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static("public"));

// Home route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to FoodRescue API!"
    });
});

// Donation API routes
app.use("/api/donations", donationRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

// Centralized error handler
app.use(errorMiddleware);

// Start server
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`FoodRescue running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();