// app.js
const express = require("express");
const availabilityRoutes = require("./routes/availabilityRoutes");

const app = express();
const PORT = 4325;

const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use("/api/availability", availabilityRoutes);

// Only start server if app.js is run directly (not when required in test)
if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; // ✅ Export for testing
