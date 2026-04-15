import express from "express";
// import User from "@models/User";
import { Env } from "@utils/Env";
import Error from "@libs/error";
import Success from "@libs/success";
import { createUser, findUserByWalletAddress } from "@utils/CsvStore";

const InitUserRoute = express.Router();

InitUserRoute.get("/:address", async (req, res) => {
  const address = req.params.address;

  // Check if address is a legitimate Solana address
  // Find a library that can validate Solana addresses

  try {
    // User.findOne({ walletAddress: address }).then((user) => {
    const user = await findUserByWalletAddress(address);

    if(user) {
      return Success(res, 200, "USER_FOUND", "Successfully obtained user data", {
        user
      });
    }

    // const newUser = new User({
    //   walletAddress: address,
    //   plates: [],
    //   isHandicapped: false
    // });
    const newUser = await createUser(address);

    return Success(res, 200, "USER_CREATED", "Successfully created user data", {
      user: newUser
    });
  } catch (err) {
    return Error(res, 500, "INTERNAL_SERVER_ERROR", "An error has occured while trying to obtain user data", err);
  }

});

export default InitUserRoute;
