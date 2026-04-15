import express, { json } from "express";
// import mongoose from "mongoose";

// Middleware
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import rateLimit from 'express-rate-limit';
import cookieParser from "cookie-parser";

// DotENV
import { Env } from "@utils/Env";
import session from "express-session";
// import MongoStore from 'connect-mongo'

// Routes
// import Route from "@routes/Route"; // Example Route
import InitUserRoute from "./routes/User/InitUserRoute";
import AddPlateRoute from "./routes/User/AddPlateRoute";
import DeletePlateRoute from "./routes/User/DeletePlateRoute";
import GetAvailableSlotsRoute from "./routes/Parking/GetAvailableSlotsRoute";
import BookSlotRoute from "./routes/Parking/BookSlotRoute";
import GetUpcomingBookingsRoute from "./routes/Parking/GetUpcomingBookingsRoute";

const app = express();
const clientUrl = Env.CLIENT_URL || "http://localhost:3000";
const sessionSecret = Env.SESSION_SECRET || "local-dev-session-secret";

// mongoose.connect(Env.MONGODB_URI).then(() => {
//   console.log("Database connection has been established.");
// }).catch((err) => {
//   console.log(err);
// });
console.log("Using local CSV storage.");

app.use(cookieParser());
app.use(
  session({
    secret: sessionSecret,
    resave: false, // This is to save the session even if it is not modified
    saveUninitialized: false, // This is to save the session even if the user is not logged in
    // store: MongoStore.create({
    //   mongoUrl: Env.MONGODB_URI,
    //   crypto: {
    //     secret: Env.MONGODB_CRYPTO,
    //   }
    // }),
    cookie: {
      // 5 days
      maxAge: 1000 * 60 * 60 * 24 * 5,
      httpOnly: false,
      secure: false,
      // sameSite: 'strict',
    },
    name: "session-name", // You may rename this to any session name you would like
  }),
);
app.use(bodyParser.json());
app.use(cors({
  origin: clientUrl,
  allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie', 'Cache-Control', 'Cookie'],
  exposedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie', 'Cache-Control', 'Cookie'],
  credentials: true
}))
app.use(helmet());
app.use(json());

const port = Env.SERVER_PORT || 8080

app.listen(port, () => {
  console.log(`Server has started successfully on port ${port}`);
}).on("error", (err) => {
  console.log(`An error has occured: ${err}`);
});

// Limiters
// app.use('/api/', rateLimit({
//   // 10 requests every minute
//   windowMs: 60 * 1000,
//   max: 10,
//   message: {
//     error: {
//       status: 429,
//       message: 'Too many requests, please try again in a minute.'
//     }
//   }
// }));

// Declaration of Routes

// Example Route Declaration
app.use("/api/user", InitUserRoute);
app.use("/api/user/add-plate", AddPlateRoute);
app.use("/api/user/delete-plate", DeletePlateRoute);
app.use("/api/parking/slots", GetAvailableSlotsRoute);
app.use("/api/parking/book", BookSlotRoute);
app.use("/api/parking/upcoming", GetUpcomingBookingsRoute);
