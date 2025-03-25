import mongoose from "mongoose"
import { env } from "../../config/env"
import { DB_NAME } from "../../config/constants";

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(`${env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB Connected: ${connection.connection.host}`)
    } catch (error) {
    console.log(`connection to DB failed`, error);
    process.exit(1);
  }
};

export default connectDB;
