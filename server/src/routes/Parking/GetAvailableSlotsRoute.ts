import express from "express";
// import Slot from "@models/Slot";
import Error from "@libs/error";
import Success from "@libs/success";
import { getSlotsByDate } from "@utils/CsvStore";

const GetAvailableSlotsRoute = express.Router();

GetAvailableSlotsRoute.post("/", async (req, res) => {
  const { date, plate } = req.body;

  try {
    // Slot.find({ date }).then((slots) => {
    const slots = await getSlotsByDate(date);

    const slotData = {
      date,
      timeSlots: {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
        12: 0,
        13: 0,
        14: 0,
        15: 0,
        16: 0,
        17: 0,
        18: 0,
        19: 0,
        20: 0,
        21: 0,
        22: 0,
        23: 0,
      }
    };

    const userSlots = slots.filter((slot) => slot.plate === plate);

    slots.forEach((slot) => {
      slot.timeSlot.forEach((time) => {
        slotData.timeSlots[time] += 1;
      });
    });

    return Success(res, 200, "SLOTS_FOUND", "Successfully found slots for the specified date", {
      slotData,
      userSlots
    });
  } catch (err) {
    return Error(res, 500, "INTERNAL_SERVER_ERROR", "An error has occured while trying to find slots for the specified date", err);
  }
})

export default GetAvailableSlotsRoute;
