const express = require("express");
const availabilityRoutes = require("./routes/availabilityRoutes");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use("/api/availability", availabilityRoutes);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
