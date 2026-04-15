import express from "express";
// import User from "@models/User";
import { Env } from "@utils/Env";
import Error from "@libs/error";
import Success from "@libs/success";
import { findUserByWalletAddress, updateUser } from "@utils/CsvStore";

const AddPlateRoute = express.Router();

AddPlateRoute.post("/", async (req, res) => {
  const { walletAddress, plate } = req.body;

  try {
    // User.findOne({ walletAddress }).then((user) => {
    const user = await findUserByWalletAddress(walletAddress);

    if(!user) {
      return Error(res, 404, "USER_NOT_FOUND", "User not found");
    }

    // check if plate exists in every user's plates array

    const plateExists = user?.plates.find((p) => p === plate);

    if(plateExists) {
      return Error(res, 400, "PLATE_EXISTS", "Plate already exists in user's plates array");
    }

    user.plates.push(plate);

    // user?.save().then((user) => {
    const updatedUser = await updateUser(user);

    return Success(res, 200, "PLATE_ADDED", "Successfully added plate to user's plates array", {
      user: updatedUser
    });
  } catch (err) {
    return Error(res, 500, "INTERNAL_SERVER_ERROR", "An error has occured while trying to add plate to user's plates array", err);
  }
});

export default AddPlateRoute;
