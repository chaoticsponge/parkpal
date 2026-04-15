import mongoose from "mongoose";
const Schema = mongoose.Schema

const slotSchema = new Schema({
  timeSlot: {
    type: Array,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  plate: {
    type: String,
    required: true,
  },
  version: {
    type: Number,
    required: true,
    default: 0,
  }
}, { timestamps: true });

const Slot = mongoose.model("slots", slotSchema)
export default Slot;