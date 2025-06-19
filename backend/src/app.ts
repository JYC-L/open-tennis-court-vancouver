import express from "express";
import cors from "cors";
import { setSampleRoutes } from "./routes/sampleRoutes";
import { setCourtRoutes } from "./routes/courtRoutes"; // ✅ <-- new line

const app = express();
app.use(cors());
app.use(express.json());

setSampleRoutes(app);
setCourtRoutes(app); // ✅ <-- register court availability routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
