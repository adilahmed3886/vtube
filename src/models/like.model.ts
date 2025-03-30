import mongoose, { Document, Model, Schema } from "mongoose";

interface ILike extends Document {
    owner: mongoose.Types.ObjectId;
    video: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
}

const likeSchema = new Schema<ILike>({
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

const Like: Model<ILike> = mongoose.model<ILike>("Like", likeSchema);

export { Like, ILike }