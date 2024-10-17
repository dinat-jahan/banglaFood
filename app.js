require("dotenv").config();
const expressLayout = require("express-ejs-layouts");

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 2000;
const connectDB = require("./server/config/db");

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
app.use("/", require("./server/routes/main"));

connectDB();

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
