import express from "express";
import cors from "cors";
import { setSampleRoutes } from "./routes/sampleRoutes";

const app = express();
app.use(cors());
app.use(express.json());

setSampleRoutes(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
