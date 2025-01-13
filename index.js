const express = require("express");
var cors = require("cors");
const { connection } = require("./config/db");
const axios = require("axios");
const { UserModel } = require("./models/User.model");
const { userRouter } = require("./routes/users.routes");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/users", userRouter);
const port=process.env.PORT;
app.listen(port, async () => {
  try {
    await connection;
    console.log("DB connected successfully");
  } catch (error) {
    console.log("connection failed");
  }
  console.log("listing on 8000");
});
