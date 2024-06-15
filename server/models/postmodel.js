import mongoose from 'mongoose';

// Define the schema for the poll options
const optionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    image: {
        type: String, // Store only the filename
        required: false,
    },
    votes: {
        type: Number,
        default: 0,
    },
}, { _id: false }); // Disable _id generation for subdocuments

// Define the schema for the poll
const pollSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: false,
    },
    options: [optionSchema],
    username: {
        type: String,
        required: true,
    },
    voters: {
        type: [{ 
            username: String, 
            optionIndex: Number 
        }], // Array of objects containing username and optionIndex
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Pre-save middleware to update the `updatedAt` field
pollSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Poll = mongoose.model('Poll', pollSchema);

export default Poll;
