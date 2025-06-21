const express = require("express");
const availabilityRoutes = require("./routes/availabilityRoutes");

const app = express();
// const PORT = process.env.PORT || 3000;
const PORT = 4325;

const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use("/api/availability", availabilityRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
