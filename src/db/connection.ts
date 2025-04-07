import mongoose from "mongoose"
import { env } from "../../config/env"

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(env.MONGODB_URI)
        console.log(`MongoDB Connected: ${connect.connection.host}`)
    } catch (error) {
    console.log(`connection to DB failed`, error);
    process.exit(1);
  }
};

export default connectDB;
