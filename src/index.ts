import { env } from "process";
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
    console.log("Error loading the server", err);
  });
