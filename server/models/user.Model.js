import mongoose from "mongoose";

const historyItemSchema = new mongoose.Schema(
  {
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    watchedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:[true, "Email is required"],
        unique:true
    },
    password:{
        type:String,
        select:false
    },
    photoUrl:{
        type:String,
        default:"",
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Channel"
    },
    // Subscriptions — channels the user follows
    subscriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
    // Liked content — video IDs the user has liked
    likedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    // Saved videos
    savedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    // Saved playlists
    savedPlaylists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist",
      },
    ],
    // Watch history (most recent first, capped at 200)
    history: [historyItemSchema],
    resetPasswordToken:{
        type:String,
    },
    resetPasswordExpiry:{
        type:Date,
    },
    resetOtp:{type:String},
    otpExpires:{type:Date},
    isoptverified:{type:Boolean,default:false},
},{timestamps:true} )

export const User = mongoose.model("User",userSchema);