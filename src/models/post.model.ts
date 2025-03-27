import mongoose, { Document, Model, Schema } from "mongoose";

interface IPost extends Document {
    content: string;
    img?: string;
    owner: mongoose.Types.ObjectId;
    likes: mongoose.Types.ObjectId[];
    dislikes: mongoose.Types.ObjectId[];
    comments: mongoose.Types.ObjectId[];
}

const postSchema = new Schema<IPost>({
    content: {
        type: String,
        required: [true, "Content is required"]
    },
    img: {
        type: String,
        trim: true
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
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
}, {timestamps: true})

const Post: Model<IPost> = mongoose.model<IPost>("Post", postSchema);

export { Post, IPost };