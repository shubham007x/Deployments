const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: { type: String, unique: true, required: true },
  avatar_url: String,
  public_repos: Number,
  public_gists: Number,
  followers: Number,
  following: Number,
  location: String,
  blog: String,
  bio: String,
  created_at: Date,
  deleted_at: { type: Date, default: null },
  friends: [String],
});

const UserModel = mongoose.model("user", UserSchema);
module.exports = { UserModel };
