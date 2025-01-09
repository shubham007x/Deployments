const mongoose = require("mongoose");
require("dotenv").config();

const connection = mongoose.connect(`${process.env.MongoDB_URL}/git`);

module.exports = { connection };
