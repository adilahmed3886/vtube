import mongoose, { Document, Model, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

interface JWTPayload {
    _id: string;
    email?: string;
    username?: string;
    displayName?: string;
}

interface CloudinaryAsset {
    public_id: string;
    url: string;
}

interface IUser extends Document {
    _id: Types.ObjectId;
    displayName: string;
    email: string;
    password: string;
    username: string;
    avatar?: CloudinaryAsset;
    coverImage?: CloudinaryAsset;
    bio?: string;
    refreshToken?: string;
    watchHistory: mongoose.Types.ObjectId[];
    comparePassword(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>({
    displayName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        index: true,
        unique: true,
        lowercase: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        index: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    avatar: {
        public_id: String,
        url: String
    },
    coverImage: {
        public_id: String,
        url: String
    },
    bio: {
        type: String,
        trim: true
    },
    refreshToken: {
        type: String,
        select: false
    },
    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }]
}, { timestamps: true })

userSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(): string {
    const payload: JWTPayload = {
        _id: this._id.toString(),
        email: this.email,
        username: this.username,
        displayName: this.displayName
    };
    
    return jwt.sign(
        payload,
        env.ACCESS_TOKEN_SECRET,
        { expiresIn: env.ACCESS_TOKEN_EXPIRY as any }
    );
}

userSchema.methods.generateRefreshToken = function(): string {
    const payload: JWTPayload = {
        _id: this._id.toString()
    };
    
    return jwt.sign(
        payload,
        env.REFRESH_TOKEN_SECRET,
        { expiresIn: env.REFRESH_TOKEN_EXPIRY as any }
    );
}

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export { User, IUser };