import express from "express";
import Error from "@libs/error";
import Success from "@libs/success";
import { getAllSlots } from "@utils/CsvStore";

const GetUpcomingBookingsRoute = express.Router();

const parseSlotDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

GetUpcomingBookingsRoute.post("/", async (req, res) => {
  const { plates } = req.body as { plates?: string[] };

  if(!plates || plates.length === 0) {
    return Success(res, 200, "UPCOMING_BOOKINGS_FOUND", "Successfully found upcoming bookings", {
      bookings: []
    });
  }

  try {
    const allSlots = await getAllSlots();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = allSlots
      .filter((slot) => plates.includes(slot.plate))
      .filter((slot) => parseSlotDate(slot.date).getTime() >= today.getTime())
      .sort((left, right) => {
        const leftDate = parseSlotDate(left.date).getTime();
        const rightDate = parseSlotDate(right.date).getTime();

        if(leftDate !== rightDate) {
          return leftDate - rightDate;
        }

        return Math.min(...left.timeSlot) - Math.min(...right.timeSlot);
      });

    return Success(res, 200, "UPCOMING_BOOKINGS_FOUND", "Successfully found upcoming bookings", {
      bookings
    });
  } catch (err) {
    return Error(res, 500, "INTERNAL_SERVER_ERROR", "An error has occured while trying to find upcoming bookings", err);
  }
});

export default GetUpcomingBookingsRoute;
