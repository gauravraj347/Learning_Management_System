import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["active", "completed", "expired", "cancelled"],
      default: "active",
    },
    enrollmentType: {
      type: String,
      enum: ["free", "paid"],
      required: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, "Amount cannot be negative"],
    },
    paymentId: {
      type: String,
      default: null,
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

// Prevent duplicate enrollment: one student per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Fast lookup by student
enrollmentSchema.index({ student: 1, status: 1 });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
