import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// One wishlist entry per student per course
wishlistSchema.index({ student: 1, course: 1 }, { unique: true });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
