import mongoose from "mongoose";

const followersSchema = new mongoose.Schema({
  username: { type: String, required: true },
  followers: [{ type: String }] // Array of usernames who follow this user
});

const Followers = mongoose.model('Followers', followersSchema);

export default Followers