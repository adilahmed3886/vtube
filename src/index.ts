import { env } from "../config/env";
import app from "./app";
import connectDB from "./db/connection";

connectDB()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(
        `Server is running on port ${env.PORT} and is in ${env.NODE_ENV} mode`
      );
    });
  })
  .catch((err) => {
    console.log("Error in making the server", err);
  });
