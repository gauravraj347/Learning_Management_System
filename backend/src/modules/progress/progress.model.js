import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: [true, "Lesson is required"],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    watchedSeconds: {
      type: Number,
      default: 0,
      min: [0, "Watched seconds cannot be negative"],
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// One progress record per student per lesson
progressSchema.index({ student: 1, lesson: 1 }, { unique: true });

// Fast lookup for course progress
progressSchema.index({ student: 1, course: 1 });

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;
