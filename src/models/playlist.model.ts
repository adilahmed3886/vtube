import mongoose, { Document, Model, Schema } from "mongoose";

interface IPlaylist extends Document {
    owner: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    videos: mongoose.Types.ObjectId[];
}

const playlistSchema = new Schema<IPlaylist>({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Owner is required"],
        index: true
    },
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    description: {
        type: String
    },
    videos: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }]
}, {timestamps: true})

const Playlist: Model<IPlaylist> = mongoose.model<IPlaylist>("Playlist", playlistSchema);

export { Playlist, IPlaylist }
