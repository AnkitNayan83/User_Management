import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";

import connectDB from "./lib/db.js";
import listRotes from "./routes/listRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

const app = express();

dotenv.config();
app.use(express.json());
app.use(morgan("dev"));

connectDB();

app.use("/api/lists", listRotes);
app.use("/api/user", userRoutes);

app.get("*", (req, res) => {
    res.send("404 Route not found");
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
});
