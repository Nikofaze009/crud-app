const express = require("express");
const cors = require("cors");
require("dotenv").config();

const path = require("path");
const fs = require("fs");

const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const userRoutes = require("./routes/userRoutes");

const connectDB = require("./config/db");

const app = express();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created uploads directory");
}

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

//routes
app.use("/api/users", userRoutes);

//swagger
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

//multer - serve static files with CORS headers
app.use("/uploads", cors(), express.static(path.join(__dirname, "..", "uploads")));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Connect to MongoDB
connectDB();

// Test route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "dashboard.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
