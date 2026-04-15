import mongoose from "mongoose";
const Schema = mongoose.Schema

const userSchema = new Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  plates: {
    type: Array,
    required: false,
    default: [],
  },
  isHandicapped: {
    type: Boolean,
    required: true,
    default: false,
  },
  version: {
    type: Number,
    required: true,
    default: 0,
  }
}, { timestamps: true });

const User = mongoose.model("users", userSchema)
export default User;