const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");

const path = require("path");

const dotenv = require("dotenv");
dotenv.config({ path: "./config/.env" });

console.log(process.env.MGD_USERNAME);
console.log(process.env.MGD_PASSWORD);
console.log(process.env.MGD_CLUSTER);
console.log(process.env.MGD_NAME);

const sauceRoutes = require("./routes/sauces");
const userRoutes = require("./routes/users");

mongoose
  .connect(
    "mongodb+srv://${process.env.MGD_USERNAME}:${process.env.MGD_PASSWORD}@${process.env.MGD_CLUSTER}.bouxf.mongodb.net/${process.env.MGD_NAME}?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("La connexion à MongoDB a réussie !"))
  .catch(() =>
    console.log("La connexion à Mongo DB a échouée. Rééssayez ultérieurement.")
  );

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(bodyParser.json());

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
