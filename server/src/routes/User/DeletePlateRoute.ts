import express from "express";
// import User from "@models/User";
import { Env } from "@utils/Env";
import Error from "@libs/error";
import Success from "@libs/success";
import { findUserByWalletAddress, updateUser } from "@utils/CsvStore";

const DeletePlateRoute = express.Router();

DeletePlateRoute.patch("/", async (req, res) => {
  const { walletAddress, plate } = req.body;

  try {
    // User.findOne({ walletAddress }).then((user) => {
    const user = await findUserByWalletAddress(walletAddress);

    if(!user) {
      return Error(res, 404, "USER_NOT_FOUND", "User not found");
    }

    // find the plate to see if it exists, if it exists, remove it and save the user
    const userPlateIndex = user?.plates.findIndex((p) => p === plate);

    if(userPlateIndex === -1 || userPlateIndex === undefined) {
      return Error(res, 400, "PLATE_NOT_FOUND", "Plate not found in user's plates array");
    }

    user.plates.splice(userPlateIndex, 1);

    // user?.save().then((user) => {
    const updatedUser = await updateUser(user);

    return Success(res, 200, "PLATE_DELETED", "Successfully deleted plate from user's plates array", {
      user: updatedUser
    });
  } catch (err) {
    return Error(res, 500, "INTERNAL_SERVER_ERROR", "An error has occured while trying to delete plate from user's plates array", err);
  }
});

export default DeletePlateRoute;
