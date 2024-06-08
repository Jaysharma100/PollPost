import mongoose from "mongoose";

const likedSchema = new mongoose.Schema({
  pollid: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true }, // Reference to the Poll model
  usernames: { type: [String], default: [] },  // Array of usernames who liked this poll
  totallikes:{type: Number, default: 0}
});

const Liked = mongoose.model('Liked', likedSchema);

export default Liked;
