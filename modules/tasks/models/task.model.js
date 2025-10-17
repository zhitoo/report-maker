import mongoose from "mongoose";

export default mongoose.model(
  "Task",
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: String,
      required: true,
      trim: true,
    },
    task_number: {
      type: String,
      required: false,
      trim: true,
    },
    time: {
      type: Number,
      required: true,
      trim: true,
    },
    tag: {
      type: String,
      required: true,
      trim: true,
    },
    created_at: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  })
);
