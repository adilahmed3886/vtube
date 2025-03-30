import mongoose, { Document, Model, Schema } from "mongoose";

interface IDislike extends Document {
    owner: mongoose.Types.ObjectId;
    video: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
}

const dislikeSchmea = new Schema<IDislike>({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Owner is required"],
        index: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    }
}, {timestamps: true})

const Dislike: Model<IDislike> = mongoose.model<IDislike>("Dislike", dislikeSchmea);

export { Dislike, IDislike }
