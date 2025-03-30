import mongoose, { Document, Model, Schema } from "mongoose";

interface IComment extends Document {
    content: string;
    owner: Schema.Types.ObjectId;
    likes: Schema.Types.ObjectId[];
    dislikes: Schema.Types.ObjectId[];
    video?: Schema.Types.ObjectId;
    post?: Schema.Types.ObjectId;
}

const commentSchema = new Schema<IComment>({
    content: {
        type: String,
        required: [true, "Content is required"]
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Owner is required"],
        index: true
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    }],
    dislikes: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    }],
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    }
}, {timestamps: true});

const Comment: Model<IComment> = mongoose.model<IComment>("Comment", commentSchema);

export { Comment, IComment };