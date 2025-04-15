import mongoose, { Document, Model, Schema } from "mongoose";

interface CloudinaryAsset {
    public_id: string;
    url: string;
}

interface IVideo extends Document {
    title: string;
    video: CloudinaryAsset;
    views: number;
    duration: number;
    isPublished: boolean;
    thumbnail?: CloudinaryAsset;
    description?: string;
    owner: mongoose.Types.ObjectId;
    likes: mongoose.Types.ObjectId[];
    dislikes: mongoose.Types.ObjectId[];
    comments: mongoose.Types.ObjectId[];
}

const videoSchema = new Schema<IVideo>({
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    video: {
        public_id: String,
        url: String
    },
    thumbnail: {
        public_id: String,
        url: String
    },
    description: {
        type: String,
    },
    isPublished: {
        type: Boolean,
        default: true,
        index: true
    },
    views: {
        type: Number,
        default: 0,
        index: true
    },
    duration: {
        type: Number,
        default: 0,
        index: true
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

}, {timestamps: true});

const Video: Model<IVideo> = mongoose.model<IVideo>("Video", videoSchema);

export { Video, IVideo };