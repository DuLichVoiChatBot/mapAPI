// src/index.ts
import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import placeRoutes from "./routes/place";

dotenv.config()
const PORT = process.env.PORT || 8080;

const app = express();

app.use(morgan("tiny"));
app.use(bodyParser.json());

app.get("/hello", (req, res) => {
  res.send("Hello World!");
});

app.post("/hello", (req, res) => {
  res.send(`Hello ${req.body.name}!`);
});

app.use("/places", placeRoutes);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
