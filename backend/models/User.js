const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      minlength: [10, "Mobile must be 10 digits"],
      maxlength: [10, "Mobile must be 10 digits"],
    },
    photo: {
      type: String,
      required: [true, "Photo is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
