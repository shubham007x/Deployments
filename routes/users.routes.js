const express = require("express");
const mongoose = require("mongoose");
const { UserModel } = require("../models/User.model");
const userRouter = express.Router();
const axios=require("axios")
//POST /user endpoint to save github user data

userRouter.post("/", async (req, res) => {
  const { username } = req.body;

  try {
    let user = await UserModel.findOne({ username }); //feching user
    console.log({ user, msg: "inside db" });

    if (!user) {
      const res = await axios.get(`https://api.github.com/users/${username}`);
      const data = res.data;
      console.log(data);

      //Saving user data to MongoDb Database
      user = new UserModel({
        username: data.login,
        avatar_url: data.avatar_url,
        public_repos: data.public_repos,
        public_gists: data.public_gists,
        followers: data.followers,
        following: data.following,
        location: data.location,
        blog: data.blog,
        bio: data.bio,
        created_at: data.created_at,
      });
      await user.save();
    }
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "error", error });
  }
});

// Endpoint to get friends
userRouter.post("/:username/friends", async (req, res) => {
  const { username } = req.params;
  console.log(req.url)
  console.log(username)
  try {
    const user = await UserModel.findOne({ username });
    //console.log(user);
    if (!user) return res.status(404).json({ error: "User not found" });

    const followersResponse = await axios.get(
      `https://api.github.com/users/${username}/followers`
    );
    const followingResponse = await axios.get(
      `https://api.github.com/users/${username}/following`
    );

    const followers = followersResponse.data.map((f) => f.login);
    console.log(followers);
    const following = followingResponse.data.map((f) => f.login);

    const mutuals = followers.filter((f) => following.includes(f));
    user.friends = mutuals;

    await user.save();
    res.json(mutuals);
  } catch (err) {
    res.status(500).json({ error: "Error finding mutual followers" });
  }
});

// Endpoint to search a particular user
userRouter.get("/search", async (req, res) => {
  const { query } = req.query;
  console.log(query);
  try {
    const users = await UserModel.find({
      $or: [
        { username: new RegExp(query, "i") },
        { location: new RegExp(query, "i") },
        { bio: new RegExp(query, "i") },
      ],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error searching users" });
  }
});

//Endpoint to delete a user
userRouter.delete("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await UserModel.findOneAndUpdate(
      { username },
      { deleted_at: new Date() },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error deleting user" });
  }
});

//Endpoint to change data in database for a user
userRouter.patch("/:username", async (req, res) => {
  const { username } = req.params;
  const { location, blog, bio } = req.body;

  try {
    // Find the user by their username
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the fields only if they are provided in the request body
    if (location) user.location = location;
    if (blog) user.blog = blog;
    if (bio) user.bio = bio;

    // Save the updated user document
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error updating user fields" });
  }
});

//Deafault Endpoint to get user in sorted order
userRouter.get("/", async (req, res) => {
  const sortField = "created_at";
  const sortOrder = 1; // Default to ascending order

  try {
    const users = await UserModel.find()
      .sort({ [sortField]: sortOrder })
      .exec();

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving users" });
  }
});
// Endpoint to get repositories for a user 


module.exports = { userRouter };
