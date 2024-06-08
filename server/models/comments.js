import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true }, // Reference to the Poll model
  username: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
