import express from "express";
import orderRoutes from "./routes/order.routes.js";

const app = express();

app.use(express.json());

// Mount modules
app.use("/api", orderRoutes);

export default app;