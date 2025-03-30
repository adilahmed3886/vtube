import mongoose, { Document, Model, Schema } from "mongoose";

interface ISubscription extends Document {
    subscriber: mongoose.Types.ObjectId;
    channel: mongoose.Types.ObjectId;
}

const subscriptionSchema = new Schema<ISubscription>({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Subscriber is required"],
        index: true
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Channel is required"],
        index: true
    }
}, {timestamps: true})

const Subscription: Model<ISubscription> = mongoose.model<ISubscription>("Subscription", subscriptionSchema);

export { Subscription, ISubscription }