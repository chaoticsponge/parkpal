import express from "express";
// import Slot from "@models/Slot";
import { Env } from "@utils/Env";
import Error from "@libs/error";
import Success from "@libs/success";
import { createSlot, findSlotByDateAndPlate, updateSlot } from "@utils/CsvStore";

const BookSlotRoute = express.Router();

BookSlotRoute.post("/", async (req, res) => {
  const { date, timeSlot, plate } = req.body;

  // check if the user already has slots booked for the specified date with the specified plate
  // then add the new slots into the selected slots for that date

  try {
    // const slot = await Slot.findOne({ date, plate });
    const slot = await findSlotByDateAndPlate(date, plate);

    if(slot) {
      slot.timeSlot = slot.timeSlot.concat(timeSlot);
      // slot.save().then((slot) => {
      const updatedSlot = await updateSlot(slot);

      return Success(res, 200, "SLOT_BOOKED", "Successfully booked the slot", {
        slot: updatedSlot
      });
    }

    // const newSlot = new Slot({
    //   date,
    //   timeSlot,
    //   plate
    // });
    const newSlot = await createSlot(date, timeSlot, plate);

    return Success(res, 200, "SLOT_BOOKED", "Successfully booked the slot", {
      id: newSlot._id,
      slot: newSlot,
    });
  } catch (err) {
    return Error(res, 500, "INTERNAL_SERVER_ERROR", "An error has occured while trying to book the slot", err);
  }
})

export default BookSlotRoute;
